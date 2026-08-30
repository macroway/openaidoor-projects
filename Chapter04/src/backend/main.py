"""
FastAPI 应用入口。
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import upload, process, export

app = FastAPI(title="询价整理助手 API", version="0.1.0")

# CORS：允许前端开发服务器访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(upload.router, prefix="/api")
app.include_router(process.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    """健康检查，确认后端正常运行。"""
    return {"status": "ok"}
