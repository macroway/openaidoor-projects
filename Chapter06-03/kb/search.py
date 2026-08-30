"""FTS5 + BM25 检索。"""

from __future__ import annotations

import re
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "storage" / "knowledge.db"

SKU_PATTERN = re.compile(r"\b([A-Z]\d{3})\b")

FILLERS = (
    "是多少",
    "多少",
    "能不能",
    "可不可以",
    "能否",
    "是不是",
    "都可以",
    "请问",
    "请直接",
    "请",
    "帮",
    "客户",
    "直接",
    "创建",
    "并",
    "通知",
    "仓库",
    "发货",
    "修改",
    "价格",
    "的",
    "吗",
    "呢",
    "什么",
    "怎样",
    "如何",
    "有没有",
    "几天",
    "大概",
    "是否",
    "已经",
    "可以",
    "进行",
    "为",
    "把",
    "将",
    "到",
    "和",
    "与",
    "或",
)

SYNONYMS = {
    "云朵椅": "A102 云朵椅",
    "实木椅": "B205 实木椅",
    "透明箱": "C301 透明收纳箱",
    "透明箱子": "C301 透明收纳箱",
    "收纳箱": "C301",
    "坐多重": "静态承重",
    "能坐多重": "静态承重",
    "最多能坐": "静态承重",
    "承重多少": "静态承重",
    "黑颜色": "黑色",
    "宽深": "宽 深",
    "七天无理由": "无理由退货 7天",
    "签收后还能": "签收 无理由退货",
    "现在签收": "签收 无理由退货",
    "清洁": "日常清洁",
    "怎么清洁": "日常清洁",
    "应该怎样清洁": "日常清洁",
    "到账": "退款 到账",
    "退款": "退款",
    "当前": "当前 7天",
    "普通成品": "普通成品 7天",
    "期限": "退货 期限",
    "口头保证": "口头承诺 退款",
    "保证今天": "口头承诺 退款",
    "特价清仓": "特价清仓",
    "已安装": "已经安装",
    "对公转账": "对公转账",
    "人工确认": "人工确认",
    "定制颜色": "定制商品 定制颜色",
    "旧版": "旧版 15天",
    "v1.3": "v1.3 15天",
    "v1.4": "v1.4 对公转账",
    "锁扣": "锁扣",
    "展开": "展开 锁扣",
    "蓝色款": "颜色",
    "防螨": "防螨",
    "改订单": "改订单 价格",
    "退货单": "退货单 草稿",
}


BOOST_TERMS = (
    "已经安装",
    "已安装",
    "对公转账",
    "人工确认",
    "退款",
    "特价清仓",
    "口头承诺",
    "7 天",
    "7天",
    "15 天",
    "15天",
    "无理由退货",
    "静态承重",
    "日常清洁",
    "定制颜色",
    "定制商品",
)


def connect(db_path: Path = DB_PATH) -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def extract_sku(query: str) -> str | None:
    match = SKU_PATTERN.search(query.upper())
    return match.group(1) if match else None


def _terms_from_text(text: str) -> list[str]:
    normalized = text
    for old, new in sorted(SYNONYMS.items(), key=lambda item: len(item[0]), reverse=True):
        normalized = normalized.replace(old, new)
    for filler in FILLERS:
        normalized = normalized.replace(filler, " ")
    normalized = re.sub(r"[，。？！、；：（）()\s]+", " ", normalized)
    terms = [t for t in normalized.split() if len(t) >= 2]
    sku = extract_sku(text)
    if sku and sku not in terms:
        terms.insert(0, sku)
    return terms


def build_queries(question: str) -> list[str]:
    """从自然语言问题生成若干 FTS 查询候选。支持逗号分隔的复合问题。"""
    parts = re.split(r"[，,；;]", question)
    queries: list[str] = []
    all_terms: list[str] = []

    for part in parts:
        terms = _terms_from_text(part)
        all_terms.extend(terms)
        if terms:
            queries.append(" ".join(terms[:6]))
        sku = extract_sku(part)
        if sku:
            queries.append(sku)

    if all_terms:
        queries.insert(0, " ".join(list(dict.fromkeys(all_terms))[:8]))
    queries.append(question)

    seen: set[str] = set()
    unique: list[str] = []
    for q in queries:
        q = q.strip()
        if q and q not in seen:
            seen.add(q)
            unique.append(q)
    return unique


def prefilter_rows(
    rows: list[sqlite3.Row],
    *,
    sku: str | None = None,
    status: str | None = "active",
) -> list[sqlite3.Row]:
    filtered = []
    for row in rows:
        if status and row["status"] != status:
            continue
        if sku and row["sku"] and row["sku"] != sku:
            continue
        filtered.append(row)
    return filtered


def _fetch_fts(conn: sqlite3.Connection, query: str, limit: int) -> list[sqlite3.Row]:
    sql = """
        SELECT c.chunk_id, c.doc_id, c.sku, c.status, c.source, c.section, c.content,
               bm25(chunk_fts) AS bm25_score
        FROM chunk_fts
        JOIN chunks AS c ON c.id = chunk_fts.rowid
        WHERE chunk_fts MATCH ?
        ORDER BY bm25_score
        LIMIT ?
    """
    return conn.execute(sql, (query, limit)).fetchall()


def _fetch_like(conn: sqlite3.Connection, term: str, limit: int) -> list[sqlite3.Row]:
    return conn.execute(
        """
        SELECT chunk_id, doc_id, sku, status, source, section, content,
               0.0 AS bm25_score
        FROM chunks
        WHERE content LIKE ?
        LIMIT ?
        """,
        (f"%{term}%", limit),
    ).fetchall()


def search(
    query: str,
    *,
    top_k: int = 5,
    status: str | None = "active",
    sku: str | None = None,
    db_path: Path = DB_PATH,
) -> list[dict]:
    """关键词检索，返回 Top-K 证据片段。"""
    conn = connect(db_path)
    try:
        detected_sku = sku or extract_sku(query)
        merged: dict[str, sqlite3.Row] = {}

        for fts_query in build_queries(query):
            try:
                rows = _fetch_fts(conn, fts_query, top_k * 3)
            except sqlite3.OperationalError:
                rows = []
            for row in rows:
                merged[row["chunk_id"]] = row

        for part in re.split(r"[，,；;]", query):
            part = part.strip()
            if not part:
                continue
            for fts_query in build_queries(part):
                try:
                    rows = _fetch_fts(conn, fts_query, top_k * 2)
                except sqlite3.OperationalError:
                    rows = []
                for row in rows:
                    merged[row["chunk_id"]] = row

        if len(merged) < top_k:
            for term in build_queries(query)[0].split():
                if len(term) < 2:
                    continue
                for row in _fetch_like(conn, term, top_k):
                    merged.setdefault(row["chunk_id"], row)

        for kw in BOOST_TERMS:
            if kw in query:
                try:
                    for row in _fetch_fts(conn, kw, top_k):
                        merged[row["chunk_id"]] = row
                except sqlite3.OperationalError:
                    pass
                for row in _fetch_like(conn, kw, top_k):
                    merged.setdefault(row["chunk_id"], row)

        if any(k in query for k in ("旧版", "v1.3")):
            inactive = conn.execute(
                """
                SELECT chunk_id, doc_id, sku, status, source, section, content,
                       0.0 AS bm25_score
                FROM chunks WHERE status = 'inactive'
                """
            ).fetchall()
            for row in inactive:
                if any(t in row["content"] for t in ("15", "旧")):
                    merged.setdefault(row["chunk_id"], row)
            rows = list(merged.values())
            if detected_sku:
                rows = [r for r in rows if not r["sku"] or r["sku"] == detected_sku]
        else:
            rows = list(merged.values())
            if status or detected_sku:
                rows = prefilter_rows(rows, sku=detected_sku, status=status)

        # BM25 越小越靠前；active 优先于 inactive
        rows.sort(
            key=lambda r: (
                0 if r["status"] == "active" else 1,
                r["bm25_score"] if r["bm25_score"] != 0 else 999.0,
            )
        )

        results = []
        for row in rows[:top_k]:
            results.append(
                {
                    "chunk_id": row["chunk_id"],
                    "doc_id": row["doc_id"],
                    "sku": row["sku"],
                    "status": row["status"],
                    "source": row["source"],
                    "section": row["section"],
                    "content": row["content"],
                    "bm25_score": row["bm25_score"],
                }
            )
        return results
    finally:
        conn.close()


def draft_from_evidence(question: str, evidence: list[dict]) -> str:
    """无 API Key 时的模板草稿：仅根据证据拼接，供课堂演示。"""
    if not evidence:
        return (
            "【草稿】当前资料中没有找到足够证据回答这个问题。"
            "请人工核对或补充资料，不要编造参数或承诺。"
        )

    lines = [f"【草稿】针对问题：{question}", "", "依据以下资料片段："]
    for idx, item in enumerate(evidence, start=1):
        lines.append(
            f"{idx}. [{item['source']} · {item['section']}] {item['content'][:180]}..."
            if len(item["content"]) > 180
            else f"{idx}. [{item['source']} · {item['section']}] {item['content']}"
        )
    lines.append("")
    lines.append(
        "请客服核对引用是否完整，并根据制度确认条件、例外和版本后再发送给客户。"
        "本系统只生成草稿，不直接创建退货单或修改订单。"
    )
    return "\n".join(lines)
