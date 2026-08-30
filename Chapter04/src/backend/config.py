"""
配置管理模块。
从环境变量或 .env 文件读取配置项。
"""
import os
from dotenv import load_dotenv

load_dotenv()

# 豆包视觉模型 API Key
DOUBAO_API_KEY: str = os.getenv("DOUBAO_API_KEY", "")

# 模型名称
DOUBAO_MODEL: str = os.getenv("DOUBAO_MODEL", "doubao-vision-pro-32k-241028")

# AI 并发调用数
AI_CONCURRENCY: int = int(os.getenv("AI_CONCURRENCY", "3"))

# 单文件最大 MB
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE", "10"))
