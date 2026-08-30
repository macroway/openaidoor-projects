"""
任务管理器。
- 维护任务状态（pending / processing / completed / failed）
- 记录进度百分比（已处理图片数 / 总图片数）
- 存储解析结果到内存字典
- 进程重启后数据丢失（MVP 设计）
"""
import logging
from typing import Dict, Optional
from models.schemas import Task, TaskStatus, InquiryRecord, ConfirmItem

logger = logging.getLogger(__name__)

# 内存中的任务存储
tasks: Dict[str, Task] = {}


def create_task(total_images: int) -> Task:
    """创建新任务。"""
    task = Task(total_images=total_images)
    tasks[task.task_id] = task
    logger.info(f"任务已创建: {task.task_id}, 共 {total_images} 张图片")
    return task


def get_task(task_id: str) -> Optional[Task]:
    """获取任务信息。"""
    return tasks.get(task_id)


def update_task_progress(task_id: str, processed: int) -> None:
    """更新任务进度。"""
    task = tasks.get(task_id)
    if task:
        task.processed_images = processed
        task.status = TaskStatus.PROCESSING


def complete_task(
    task_id: str,
    records: list[InquiryRecord],
    confirm_items: list[ConfirmItem],
) -> None:
    """标记任务完成，存储结果。"""
    task = tasks.get(task_id)
    if task:
        task.status = TaskStatus.COMPLETED
        task.processed_images = task.total_images
        task.records = records
        task.confirm_items = confirm_items
        logger.info(f"任务完成: {task_id}, {len(records)} 条记录, {len(confirm_items)} 个确认问题")


def fail_task(task_id: str, error_message: str) -> None:
    """标记任务失败。"""
    task = tasks.get(task_id)
    if task:
        task.status = TaskStatus.FAILED
        task.error_message = error_message
        logger.error(f"任务失败: {task_id}, 错误: {error_message}")
