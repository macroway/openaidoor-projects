"""
文件上传路由。
"""
import os
import uuid
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from pydantic import BaseModel

from config import MAX_FILE_SIZE_MB

router = APIRouter(tags=["upload"])

# 允许的文件格式
ALLOWED_EXTENSIONS = {".png", ".jpg", ".jpeg"}

# 临时存储目录
UPLOAD_DIR = Path("/tmp/inquiry-uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# 内存中存储已上传文件的信息
uploaded_files: dict[str, dict] = {}


class FileInfo(BaseModel):
    file_id: str
    filename: str
    size: int
    content_type: str


class UploadResponse(BaseModel):
    files: List[FileInfo]


def validate_file(filename: str, content_type: str, size: int) -> None:
    """校验文件格式和大小。"""
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式: {ext}。仅支持 PNG、JPG 格式。"
        )
    
    max_size = MAX_FILE_SIZE_MB * 1024 * 1024
    if size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"文件过大: {size / 1024 / 1024:.1f}MB。最大允许 {MAX_FILE_SIZE_MB}MB。"
        )


@router.post("/upload", response_model=UploadResponse)
async def upload_files(files: List[UploadFile] = File(...)):
    """
    上传图片文件。
    - 校验格式（PNG/JPG）和大小（≤10MB）
    - 存到临时目录
    - 返回文件信息列表
    """
    results = []
    
    for file in files:
        # 读取文件内容以获取大小
        content = await file.read()
        size = len(content)
        
        # 校验
        validate_file(file.filename or "unknown", file.content_type or "", size)
        
        # 生成唯一 ID
        file_id = str(uuid.uuid4())
        ext = Path(file.filename or "unknown").suffix.lower()
        saved_filename = f"{file_id}{ext}"
        file_path = UPLOAD_DIR / saved_filename
        
        # 保存文件
        with open(file_path, "wb") as f:
            f.write(content)
        
        # 记录文件信息
        file_info = {
            "file_id": file_id,
            "filename": file.filename or "unknown",
            "size": size,
            "content_type": file.content_type or "image/png",
            "path": str(file_path),
        }
        uploaded_files[file_id] = file_info
        
        results.append(FileInfo(
            file_id=file_id,
            filename=file.filename or "unknown",
            size=size,
            content_type=file.content_type or "image/png",
        ))
    
    return UploadResponse(files=results)


@router.delete("/upload/{file_id}")
async def delete_file(file_id: str):
    """
    删除已上传文件。
    """
    if file_id not in uploaded_files:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    file_info = uploaded_files[file_id]
    file_path = Path(file_info["path"])
    
    # 删除物理文件
    if file_path.exists():
        file_path.unlink()
    
    # 从内存中移除
    del uploaded_files[file_id]
    
    return {"message": "文件已删除", "file_id": file_id}


@router.get("/upload")
async def list_files():
    """
    列出所有已上传文件。
    """
    files = [
        FileInfo(
            file_id=info["file_id"],
            filename=info["filename"],
            size=info["size"],
            content_type=info["content_type"],
        )
        for info in uploaded_files.values()
    ]
    return {"files": files}
