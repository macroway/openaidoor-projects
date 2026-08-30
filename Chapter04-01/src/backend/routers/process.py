"""
处理任务路由。
- POST /api/process：接收文件列表，创建任务，异步执行解析
- GET /api/task/{task_id}/status：返回进度（已处理/总数/百分比）
- GET /api/task/{task_id}/result：返回解析结果 JSON
"""
import asyncio
import logging
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from routers.upload import uploaded_files
from services.ai_parser import parse_image
from services.dedup import deduplicate_records
from services import task_manager
from models.schemas import TaskStatus

logger = logging.getLogger(__name__)

router = APIRouter(tags=["process"])


class ProcessRequest(BaseModel):
    file_ids: List[str]


class ProcessResponse(BaseModel):
    task_id: str
    total_images: int


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    total_images: int
    processed_images: int
    progress: float  # 0-100


@router.post("/process", response_model=ProcessResponse)
async def start_process(request: ProcessRequest):
    """
    开始处理任务。
    接收文件 ID 列表，创建任务，异步执行 AI 解析 + 去重。
    """
    file_ids = request.file_ids

    if not file_ids:
        raise HTTPException(status_code=400, detail="文件列表不能为空")

    # 校验所有文件 ID 存在
    file_paths = []
    for fid in file_ids:
        if fid not in uploaded_files:
            raise HTTPException(status_code=404, detail=f"文件不存在: {fid}")
        file_paths.append(uploaded_files[fid]["path"])

    # 创建任务，立即标记为处理中
    task = task_manager.create_task(total_images=len(file_paths))
    task_manager.update_task_progress(task.task_id, processed=0)

    # 启动后台异步任务
    asyncio.create_task(_run_pipeline(task.task_id, file_paths))

    return ProcessResponse(
        task_id=task.task_id,
        total_images=len(file_paths),
    )


@router.get("/task/{task_id}/status", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """查询任务进度。"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    progress = (
        (task.processed_images / task.total_images * 100)
        if task.total_images > 0
        else 0
    )

    return TaskStatusResponse(
        task_id=task.task_id,
        status=task.status.value,
        total_images=task.total_images,
        processed_images=task.processed_images,
        progress=round(progress, 1),
    )


@router.get("/task/{task_id}/result")
async def get_task_result(task_id: str):
    """获取任务结果。"""
    task = task_manager.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="任务不存在")

    if task.status == TaskStatus.FAILED:
        raise HTTPException(
            status_code=500,
            detail=f"任务失败: {task.error_message}",
        )

    if task.status != TaskStatus.COMPLETED:
        raise HTTPException(
            status_code=202,
            detail="任务尚未完成",
        )

    return {
        "task_id": task_id,
        "records": [r.model_dump() for r in task.records],
        "confirm_items": [c.model_dump() for c in task.confirm_items],
    }


async def _run_pipeline(task_id: str, file_paths: List[str]):
    """
    后台执行完整处理流水线：AI 解析 → 去重合并 → 存储结果。
    """
    try:
        all_raw_records = []
        total = len(file_paths)

        for i, path in enumerate(file_paths):
            # 先更新进度（让前端立即看到当前正在处理第几张）
            task_manager.update_task_progress(task_id, processed=i)
            logger.info(f"[{task_id}] 解析图片 {i+1}/{total}: {path}")
            try:
                result = await parse_image(path)
                all_raw_records.extend(result.records)
            except Exception as e:
                logger.error(f"[{task_id}] 解析图片失败 {path}: {e}")
                # 单张图片失败不中断整个流程

            # 处理完一张，更新进度
            task_manager.update_task_progress(task_id, processed=i + 1)

        # 去重与矛盾消解
        records, confirm_items = deduplicate_records(all_raw_records)

        # 完成任务
        task_manager.complete_task(task_id, records, confirm_items)
        logger.info(f"[{task_id}] 流水线完成")

    except Exception as e:
        logger.exception(f"[{task_id}] 流水线异常: {e}")
        task_manager.fail_task(task_id, str(e))
