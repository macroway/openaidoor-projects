"""
AI 解析服务。
- 将图片编码为 base64
- 调用豆包视觉 API
- 解析返回的 JSON
- 错误处理：超时重试、格式异常重试、限流退避
"""
import base64
import json
import logging
import asyncio
from pathlib import Path
from typing import List, Dict, Any, Optional

import httpx

from config import DOUBAO_API_KEY, DOUBAO_MODEL, AI_CONCURRENCY
from prompts.extract_prompt import get_extract_prompt
from models.schemas import AIExtractResult

logger = logging.getLogger(__name__)

# 豆包 API 地址
API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

# 超时和重试配置
REQUEST_TIMEOUT = 60.0  # 秒
MAX_RETRIES = 3
RETRY_DELAY = 2.0  # 秒，指数退避基数


def encode_image_to_base64(image_path: str) -> str:
    """将图片文件编码为 base64 字符串。"""
    with open(image_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def parse_ai_response(response_text: str) -> AIExtractResult:
    """
    解析 AI 返回的 JSON 文本。
    处理可能的格式问题（如 markdown 代码块包裹）。
    """
    # 尝试提取 JSON 部分
    text = response_text.strip()
    
    # 处理 markdown 代码块包裹的情况
    if "```json" in text:
        start = text.find("```json") + 7
        end = text.find("```", start)
        if end > start:
            text = text[start:end].strip()
    elif "```" in text:
        start = text.find("```") + 3
        end = text.find("```", start)
        if end > start:
            text = text[start:end].strip()
    
    # 解析 JSON
    data = json.loads(text)
    
    # 提取 records
    records = data.get("records", [])
    
    return AIExtractResult(
        records=records,
        raw_response=response_text
    )


async def call_doubao_api(
    image_base64: str,
    client: httpx.AsyncClient,
    retry_count: int = 0
) -> str:
    """
    调用豆包视觉 API。
    
    Args:
        image_base64: 图片的 base64 编码
        client: httpx 异步客户端
        retry_count: 当前重试次数
    
    Returns:
        AI 返回的文本内容
    
    Raises:
        Exception: 调用失败时抛出异常
    """
    prompt = get_extract_prompt()
    
    headers = {
        "Authorization": f"Bearer {DOUBAO_API_KEY}",
        "Content-Type": "application/json",
    }
    
    payload = {
        "model": DOUBAO_MODEL,
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{image_base64}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.1,  # 低温度，提高确定性
        "max_tokens": 4000,
    }
    
    try:
        response = await client.post(
            API_URL,
            headers=headers,
            json=payload,
            timeout=REQUEST_TIMEOUT
        )
        
        # 处理限流
        if response.status_code == 429:
            if retry_count < MAX_RETRIES:
                delay = RETRY_DELAY * (2 ** retry_count)
                logger.warning(f"API 限流，{delay}秒后重试 ({retry_count + 1}/{MAX_RETRIES})")
                await asyncio.sleep(delay)
                return await call_doubao_api(image_base64, client, retry_count + 1)
            else:
                raise Exception(f"API 限流，已达最大重试次数: {response.text}")
        
        # 处理其他错误
        if response.status_code != 200:
            raise Exception(f"API 调用失败 ({response.status_code}): {response.text}")
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # 记录 token 使用
        usage = data.get("usage", {})
        logger.info(f"Token 使用: prompt={usage.get('prompt_tokens', 0)}, "
                   f"completion={usage.get('completion_tokens', 0)}, "
                   f"total={usage.get('total_tokens', 0)}")
        
        return content
        
    except httpx.TimeoutException:
        if retry_count < MAX_RETRIES:
            delay = RETRY_DELAY * (2 ** retry_count)
            logger.warning(f"请求超时，{delay}秒后重试 ({retry_count + 1}/{MAX_RETRIES})")
            await asyncio.sleep(delay)
            return await call_doubao_api(image_base64, client, retry_count + 1)
        else:
            raise Exception("API 请求超时，已达最大重试次数")
    
    except json.JSONDecodeError as e:
        # API 返回格式异常
        if retry_count < MAX_RETRIES:
            logger.warning(f"API 返回格式异常，重试 ({retry_count + 1}/{MAX_RETRIES}): {e}")
            await asyncio.sleep(RETRY_DELAY)
            return await call_doubao_api(image_base64, client, retry_count + 1)
        else:
            raise Exception(f"API 返回格式异常: {e}")


async def parse_image(image_path: str) -> AIExtractResult:
    """
    解析单张图片，提取询价信息。
    
    Args:
        image_path: 图片文件路径
    
    Returns:
        AIExtractResult: 提取结果
    """
    logger.info(f"开始解析图片: {image_path}")
    
    # 检查文件是否存在
    if not Path(image_path).exists():
        raise FileNotFoundError(f"图片文件不存在: {image_path}")
    
    # 编码图片
    image_base64 = encode_image_to_base64(image_path)
    logger.info(f"图片编码完成，大小: {len(image_base64)} 字符")
    
    # 调用 API
    async with httpx.AsyncClient() as client:
        response_text = await call_doubao_api(image_base64, client)
    
    logger.info(f"API 返回内容长度: {len(response_text)} 字符")
    
    # 解析响应
    result = parse_ai_response(response_text)
    logger.info(f"提取到 {len(result.records)} 条记录")
    
    return result


async def parse_images(image_paths: List[str]) -> List[AIExtractResult]:
    """
    并发解析多张图片。
    
    Args:
        image_paths: 图片文件路径列表
    
    Returns:
        每张图片的解析结果列表
    """
    semaphore = asyncio.Semaphore(AI_CONCURRENCY)
    
    async def parse_with_limit(path: str) -> AIExtractResult:
        async with semaphore:
            return await parse_image(path)
    
    tasks = [parse_with_limit(path) for path in image_paths]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # 处理异常结果
    final_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            logger.error(f"解析图片失败 {image_paths[i]}: {result}")
            final_results.append(AIExtractResult(records=[], raw_response=f"ERROR: {result}"))
        else:
            final_results.append(result)
    
    return final_results


def parse_image_sync(image_path: str) -> AIExtractResult:
    """同步版本的图片解析（用于测试）。"""
    return asyncio.run(parse_image(image_path))
