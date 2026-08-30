"""
导出 Excel 路由。
- POST /api/export：接收前端编辑后的最终数据，生成双 Sheet xlsx 并返回下载
"""
import logging
from datetime import datetime
from typing import List, Dict, Any
from urllib.parse import quote

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel

from services.excel_builder import build_excel

logger = logging.getLogger(__name__)

router = APIRouter(tags=["export"])


class ExportRequest(BaseModel):
    records: List[Dict[str, Any]]
    confirm_items: List[Dict[str, Any]] = []


@router.post("/export")
async def export_excel(request: ExportRequest):
    """
    导出 Excel 文件。
    接收前端编辑后的最终数据，生成双 Sheet xlsx 并返回文件流。
    """
    if not request.records:
        raise HTTPException(status_code=400, detail="没有可导出的数据")

    try:
        excel_bytes = build_excel(request.records, request.confirm_items)

        # 生成文件名（中文需要 URL 编码）
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename_cn = f"询价整理_{timestamp}.xlsx"
        filename_ascii = f"inquiry_{timestamp}.xlsx"
        encoded_name = quote(filename_cn)

        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": f"attachment; filename=\"{filename_ascii}\"; filename*=UTF-8''{encoded_name}",
                "Content-Length": str(len(excel_bytes)),
            },
        )

    except Exception as e:
        logger.exception(f"导出 Excel 失败: {e}")
        raise HTTPException(status_code=500, detail=f"导出失败: {str(e)}")
