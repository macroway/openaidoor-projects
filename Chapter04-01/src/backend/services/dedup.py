"""
去重与矛盾消解服务。
- 按客户名称 + 商品名称分组
- 同一组内多条记录合并（后出现的覆盖先出现的）
- 分批交货处理：数量取总数，交期栏记录分批信息
- 缺失信息识别：检查必填字段，未提及的生成 ConfirmItem
- 不确定信息标注：AI 返回 _uncertain: true 的字段列入 ConfirmItem
"""
import logging
from typing import List, Dict, Any, Tuple
from collections import defaultdict

from models.schemas import InquiryRecord, ConfirmItem, Urgency

logger = logging.getLogger(__name__)

# 识别为"未知商品"的关键词（AI 可能返回多种表述）
UNKNOWN_PRODUCT_KEYWORDS = {"未知商品", "未明确", "未提及", "未知", "不明确", "不清楚"}


def _is_unknown_product(product: str) -> bool:
    """判断商品名是否属于未知/未明确的情况。"""
    if not product:
        return True
    cleaned = product.replace("_uncertain", "").strip()
    return any(kw in cleaned for kw in UNKNOWN_PRODUCT_KEYWORDS)

# 必填字段（用于缺失识别）
# 字段名中英文映射
FIELD_NAME_CN = {
    "customer_name": "客户名称",
    "product": "商品名称",
    "spec": "规格",
    "quantity": "数量",
    "target_price": "期望价格",
    "delivery": "交期/到货地",
    "urgency": "紧急度",
}

REQUIRED_FIELDS = {
    "product": "商品名称",
    "spec": "规格",
    "quantity": "数量",
    "target_price": "期望价格",
    "delivery": "交期/到货地",
}


def deduplicate_records(
    raw_records: List[Dict[str, Any]]
) -> Tuple[List[InquiryRecord], List[ConfirmItem]]:
    """
    对 AI 提取的原始记录进行去重、合并和缺失识别。

    Args:
        raw_records: AI 返回的原始记录列表（dict 格式）

    Returns:
        (去重后的 InquiryRecord 列表, 人工确认问题列表)
    """
    if not raw_records:
        return [], []

    # 第一步：转为 InquiryRecord 并按 (客户名称, 商品名称) 分组
    groups: Dict[Tuple[str, str], List[Dict[str, Any]]] = defaultdict(list)

    for record in raw_records:
        customer = (record.get("customer_name") or "未知客户").strip()
        product = (record.get("product") or "未知商品").strip()
        groups[(customer, product)].append(record)

    logger.info(f"分组结果: {len(raw_records)} 条记录 → {len(groups)} 组")

    # 第一步补充：将同一客户的"未知商品"记录合并到该客户的其他商品组
    unknown_groups = {k: v for k, v in groups.items() if _is_unknown_product(k[1])}
    known_groups = {k: v for k, v in groups.items() if not _is_unknown_product(k[1])}

    for (customer, _), unknown_records in unknown_groups.items():
        # 找该客户的其他商品组
        customer_known = [(k, v) for k, v in known_groups.items() if k[0] == customer]
        if customer_known:
            # 合并到第一个已知商品组（通常连续对话只有一个商品）
            target_key, target_records = customer_known[0]
            target_records.extend(unknown_records)
            logger.info(f"将 {customer} 的 {len(unknown_records)} 条'未知商品'记录合并到 '{target_key[1]}'")
        else:
            # 该客户只有"未知商品"，保留原样
            known_groups[(customer, "未知商品")] = unknown_records

    groups = known_groups
    logger.info(f"合并未知商品后: {len(groups)} 组")

    # 第二步：组内合并（后出现的覆盖先出现的）
    merged_records: List[InquiryRecord] = []
    confirm_items: List[ConfirmItem] = []

    for (customer, product), group_records in groups.items():
        if len(group_records) == 1:
            # 单条记录，直接使用
            merged = _build_record(group_records[0])
        else:
            # 多条记录，合并
            merged = _merge_group(customer, product, group_records)
            logger.info(f"合并 {customer} - {product}: {len(group_records)} 条 → 1 条")

        merged_records.append(merged)

        # 第三步：缺失信息识别
        missing = _find_missing_fields(merged)
        if missing:
            confirm_items.append(ConfirmItem(
                customer_name=customer,
                issue=f"缺失信息: {', '.join(missing)}",
                suggestion=f"请向 {customer} 确认{merged.product}的{'、'.join(missing)}",
            ))

        # 第四步：不确定信息标注
        uncertain = _find_uncertain_fields(group_records)
        if uncertain:
            cn_fields = ", ".join(FIELD_NAME_CN.get(k, k) for k in uncertain.keys())
            cn_details = "; ".join(
                f"{FIELD_NAME_CN.get(k, k)}({v})" for k, v in uncertain.items()
            )
            confirm_items.append(ConfirmItem(
                customer_name=customer,
                issue=f"不确定信息: {cn_fields}",
                suggestion=f"请向 {customer} 确认以下信息: {cn_details}",
            ))

    logger.info(f"去重完成: {len(merged_records)} 条记录, {len(confirm_items)} 个确认问题")
    return merged_records, confirm_items


def _build_record(data: Dict[str, Any]) -> InquiryRecord:
    """将 dict 转为 InquiryRecord。"""
    urgency_str = data.get("urgency") or "普通"
    try:
        urgency = Urgency(urgency_str)
    except ValueError:
        urgency = Urgency.NORMAL

    return InquiryRecord(
        customer_name=data.get("customer_name") or "未知客户",
        product=data.get("product") or "未知商品",
        spec=data.get("spec"),
        quantity=data.get("quantity"),
        target_price=data.get("target_price"),
        delivery=data.get("delivery"),
        urgency=urgency,
        missing_info=data.get("missing_info"),
        source_text=data.get("source_text"),
        confidence=data.get("confidence"),
    )


def _merge_group(
    customer: str,
    product: str,
    records: List[Dict[str, Any]],
) -> InquiryRecord:
    """合并同一客户同一商品的多条记录。后出现的覆盖先出现的。"""
    merged = {
        "customer_name": customer,
        "product": product,
        "spec": None,
        "quantity": None,
        "target_price": None,
        "delivery": None,
        "urgency": "普通",
        "missing_info": None,
        "source_text": None,
        "confidence": None,
    }

    # 按顺序合并，后者覆盖前者
    for record in records:
        for key in ["spec", "quantity", "target_price", "delivery", "urgency", "source_text"]:
            value = record.get(key)
            if value and value != "-":
                # 交期字段：如果已有值，追加分批信息
                if key == "delivery" and merged[key]:
                    merged[key] = f"{merged[key]}；{value}"
                else:
                    # 其他字段（包括数量）：后者覆盖前者（取最终值）
                    merged[key] = value

        # 合并 missing_info
        if record.get("missing_info"):
            if merged["missing_info"]:
                merged["missing_info"] = f"{merged['missing_info']}、{record['missing_info']}"
            else:
                merged["missing_info"] = record["missing_info"]

    return _build_record(merged)


def _find_missing_fields(record: InquiryRecord) -> List[str]:
    """检查必填字段是否缺失。"""
    missing = []
    field_map = {
        "spec": record.spec,
        "quantity": record.quantity,
        "target_price": record.target_price,
        "delivery": record.delivery,
    }
    for field, label in REQUIRED_FIELDS.items():
        if field == "product":
            continue  # 商品名称是分组依据，不会缺失
        value = field_map.get(field)
        if not value or value == "-" or value.strip() == "":
            missing.append(label)
    return missing


def _find_uncertain_fields(records: List[Dict[str, Any]]) -> Dict[str, str]:
    """查找 AI 标记为不确定的字段。如果组内已有确定值则跳过。"""
    # 先收集所有确定值（没有 _uncertain 标记的字段）
    definite_values: Dict[str, Any] = {}
    for record in records:
        confidence = record.get("confidence", {})
        if isinstance(confidence, dict):
            for field, is_confident in confidence.items():
                if is_confident is True and record.get(field):
                    definite_values[field] = record[field]

    # 再收集不确定字段，但跳过已有确定值的
    uncertain = {}
    for record in records:
        confidence = record.get("confidence", {})
        if isinstance(confidence, dict):
            for field, info in confidence.items():
                if field in definite_values:
                    continue  # 已有确定值，不算不确定
                # confidence=True 但值为空 → 只是缺失，不是不确定
                if info is True and not record.get(field):
                    continue
                if isinstance(info, dict) and info.get("_uncertain"):
                    uncertain[field] = str(info.get("value", record.get(field, "")))
                elif isinstance(info, str) and "uncertain" in info.lower():
                    uncertain[field] = str(record.get(field, ""))
    return uncertain
