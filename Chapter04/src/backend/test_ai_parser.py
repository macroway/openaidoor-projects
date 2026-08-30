"""
AI 解析服务测试脚本。
用法: python test_ai_parser.py [图片路径]
"""
import asyncio
import sys
import json
import logging

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

from services.ai_parser import parse_image
from config import DOUBAO_API_KEY

async def test_parse(image_path: str):
    """测试解析单张图片。"""
    print(f"\n{'='*60}")
    print(f"测试图片: {image_path}")
    print(f"API Key 已配置: {bool(DOUBAO_API_KEY)}")
    print(f"{'='*60}\n")
    
    try:
        result = await parse_image(image_path)
        
        print("\n解析结果:")
        print(f"  记录数: {len(result.records)}")
        
        for i, record in enumerate(result.records):
            print(f"\n  记录 {i+1}:")
            print(f"    客户名称: {record.get('customer_name', 'N/A')}")
            print(f"    商品: {record.get('product', 'N/A')}")
            print(f"    规格: {record.get('spec', 'N/A')}")
            print(f"    数量: {record.get('quantity', 'N/A')}")
            print(f"    期望价格: {record.get('target_price', 'N/A')}")
            print(f"    交期: {record.get('delivery', 'N/A')}")
            print(f"    紧急度: {record.get('urgency', 'N/A')}")
            print(f"    缺失信息: {record.get('missing_info', 'N/A')}")
        
        if result.raw_response:
            print(f"\n原始响应 (前500字符):")
            print(result.raw_response[:500])
        
        return True
        
    except Exception as e:
        print(f"\n解析失败: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python test_ai_parser.py <图片路径>")
        print("\n提示: 当前没有测试截图。请提供一张微信聊天截图进行测试。")
        print("或者使用之前上传测试创建的图片: /tmp/test-image.png")
        sys.exit(1)
    
    image_path = sys.argv[1]
    success = asyncio.run(test_parse(image_path))
    sys.exit(0 if success else 1)
