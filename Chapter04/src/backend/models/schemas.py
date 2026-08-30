"""
Pydantic 数据模型定义。
"""
from enum import Enum
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
import uuid


class Urgency(str, Enum):
    """紧急度枚举。"""
    NORMAL = "普通"
    URGENT = "较急"
    VERY_URGENT = "紧急"


class InquiryRecord(BaseModel):
    """单条询价记录。"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str = Field(description="客户名称，无法识别时为'未知客户'")
    product: str = Field(description="商品名称")
    spec: Optional[str] = Field(default=None, description="规格（颜色、尺寸、型号等）")
    quantity: Optional[str] = Field(default=None, description="数量，支持'100（第一批60+第二批40）'格式")
    target_price: Optional[str] = Field(default=None, description="期望价格，未提及时为'-'")
    delivery: Optional[str] = Field(default=None, description="交期和到货地")
    urgency: Urgency = Field(default=Urgency.NORMAL, description="紧急度")
    missing_info: Optional[str] = Field(default=None, description="缺失信息描述")
    source_text: Optional[str] = Field(default=None, description="原文依据（关键片段）")
    confidence: Optional[Dict[str, Any]] = Field(default=None, description="各字段置信度标记")

    @field_validator('quantity', 'target_price', 'spec', 'delivery', 'customer_name', 'product', mode='before')
    @classmethod
    def coerce_to_str(cls, v: Any) -> Optional[str]:
        """AI 模型可能返回 int/float，统一转为字符串。"""
        if v is None:
            return v
        return str(v)

    class Config:
        json_schema_extra = {
            "example": {
                "customer_name": "暖家生活馆陈老板",
                "product": "折叠脏衣篮",
                "spec": "45L，大号，带盖，米白色",
                "quantity": "100（第一批60，第二批40）",
                "target_price": "-",
                "delivery": "第一批8月18日前，第二批8月22日前，苏州吴中仓",
                "urgency": "普通",
                "missing_info": "产品单价",
                "source_text": "客户说：米白色120个...后来改口100个"
            }
        }


class ConfirmItem(BaseModel):
    """人工确认问题。"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str = Field(description="对应的客户")
    issue: str = Field(description="问题描述（哪项信息缺失或不确定）")
    suggestion: str = Field(description="建议的追问内容")


class TaskStatus(str, Enum):
    """任务状态枚举。"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Task(BaseModel):
    """任务状态。"""
    task_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: TaskStatus = Field(default=TaskStatus.PENDING)
    total_images: int = Field(default=0, description="总图片数")
    processed_images: int = Field(default=0, description="已处理图片数")
    records: List[InquiryRecord] = Field(default_factory=list, description="解析结果")
    confirm_items: List[ConfirmItem] = Field(default_factory=list, description="人工确认问题")
    error_message: Optional[str] = Field(default=None, description="失败时的错误信息")
    created_at: datetime = Field(default_factory=datetime.now)


class AIExtractResult(BaseModel):
    """AI 提取结果的原始返回。"""
    records: List[Dict[str, Any]] = Field(default_factory=list, description="提取的记录列表")
    raw_response: Optional[str] = Field(default=None, description="AI 原始返回内容")
