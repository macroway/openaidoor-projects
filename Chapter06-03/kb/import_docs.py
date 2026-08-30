"""从 data/ 导入原始资料到 storage/knowledge.db。"""

from __future__ import annotations

import csv
import hashlib
import re
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
STORAGE_DIR = PROJECT_ROOT / "storage"
DB_PATH = STORAGE_DIR / "knowledge.db"
QUESTIONS_CSV = PROJECT_ROOT / "tests" / "questions.csv"

SCHEMA = """
CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY,
    doc_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    version TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    owner TEXT,
    content_hash TEXT,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY,
    chunk_id TEXT UNIQUE NOT NULL,
    doc_id TEXT NOT NULL,
    sku TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    source TEXT NOT NULL,
    section TEXT,
    content TEXT NOT NULL,
    FOREIGN KEY (doc_id) REFERENCES documents(doc_id)
);

CREATE VIRTUAL TABLE IF NOT EXISTS chunk_fts USING fts5(
    content,
    content='chunks',
    content_rowid='id',
    tokenize='trigram'
);

CREATE TABLE IF NOT EXISTS test_cases (
    case_id TEXT PRIMARY KEY,
    question_type TEXT,
    question TEXT NOT NULL,
    expected_chunk_ids TEXT NOT NULL,
    expected_action TEXT NOT NULL,
    check_point TEXT
);

CREATE TABLE IF NOT EXISTS evaluation_runs (
    id INTEGER PRIMARY KEY,
    run_id TEXT NOT NULL,
    case_id TEXT NOT NULL,
    strategy TEXT,
    recall_hit INTEGER,
    reciprocal_rank REAL,
    faithful INTEGER,
    citation_ok INTEGER,
    refusal_ok INTEGER,
    error_type TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY,
    case_id TEXT,
    question TEXT NOT NULL,
    verdict TEXT NOT NULL,
    comment TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
"""


def sha16(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:16]


def parse_front_matter(text: str) -> tuple[dict[str, str], str]:
    if not text.startswith("---"):
        return {}, text
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text
    meta: dict[str, str] = {}
    for line in parts[1].strip().splitlines():
        if ":" in line:
            key, value = line.split(":", 1)
            meta[key.strip()] = value.strip()
    return meta, parts[2].strip()


def split_markdown_sections(body: str) -> list[tuple[str, str]]:
    sections: list[tuple[str, str]] = []
    current_title = "全文"
    current_lines: list[str] = []
    for line in body.splitlines():
        if line.startswith("#"):
            if current_lines:
                sections.append((current_title, "\n".join(current_lines).strip()))
            current_title = line.lstrip("#").strip()
            current_lines = []
        else:
            current_lines.append(line)
    if current_lines:
        sections.append((current_title, "\n".join(current_lines).strip()))
    return [(title, content) for title, content in sections if content]


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text)
    return text.strip("-") or "section"


def product_row_to_chunk(row: dict[str, str]) -> tuple[str, str]:
    colors = row["colors"].replace(";", "、")
    content = (
        f"SKU：{row['sku']}\n"
        f"商品名称：{row['name']}\n"
        f"类别：{row['category']}\n"
        f"静态承重：{row['static_weight_kg']} 千克\n"
        f"尺寸：宽 {row['width_cm']} 厘米"
    )
    if row.get("depth_cm"):
        content += f"、深 {row['depth_cm']} 厘米"
    if row.get("height_cm"):
        content += f"、高 {row['height_cm']} 厘米"
    if row.get("seat_height_cm"):
        content += f"，座面高 {row['seat_height_cm']} 厘米"
    content += f"\n颜色：{colors}\n"
    content += f"日常清洁：{row['cleaning']}\n"
    content += f"使用注意：{row['usage_notes']}"
    if "黑色" in colors:
        content += f"\n黑色款宽 {row['width_cm']} 厘米、深 {row['depth_cm']} 厘米"
    return f"product-{row['sku'].lower()}", content


def load_products() -> tuple[dict, list[dict]]:
    path = DATA_DIR / "products.csv"
    rows = list(csv.DictReader(path.open(encoding="utf-8")))
    doc = {
        "doc_id": "products-v1",
        "title": "商品参数表",
        "source": "products.csv",
        "version": "v1",
        "status": "active",
        "owner": "商品运营",
        "notes": "按 SKU 一行一条记录切分",
    }
    chunks = []
    for row in rows:
        chunk_id, content = product_row_to_chunk(row)
        chunks.append(
            {
                "chunk_id": chunk_id,
                "doc_id": doc["doc_id"],
                "sku": row["sku"],
                "status": row["status"],
                "source": "products.csv",
                "section": row["name"],
                "content": content,
            }
        )
    doc["content_hash"] = sha16("\n\n".join(c["content"] for c in chunks))
    return doc, chunks


def load_markdown(path: Path, doc_id: str, chunk_prefix: str) -> tuple[dict, list[dict]]:
    raw = path.read_text(encoding="utf-8")
    meta, body = parse_front_matter(raw)
    status = meta.get("status", "active")
    doc = {
        "doc_id": doc_id,
        "title": meta.get("title", path.stem),
        "source": meta.get("source", path.name),
        "version": meta.get("version"),
        "status": status,
        "owner": meta.get("owner"),
        "notes": meta.get("scope"),
    }
    chunks: list[dict] = []

    # 规则卡片：returns 按关键小节切分，便于检索
    if path.name.startswith("returns"):
        cards = [
            (
                f"{chunk_prefix}-standard",
                "普通商品退货",
                (
                    "适用对象：普通成品。"
                    "当前规则：商品签收后 7 天内，保持未拆封、配件齐全且不影响二次销售的，可以申请无理由退货。"
                    "退货期限为签收后 7 天。"
                    "因质量问题产生的退货运费由商家承担。"
                )
                if status == "active"
                else next(
                    (
                        s[1]
                        for s in split_markdown_sections(body)
                        if "普通商品退货" in s[0]
                    ),
                    "",
                ),
            ),
            (
                f"{chunk_prefix}-custom",
                "定制商品例外",
                "适用对象：定制商品（含定制颜色）。条件：非质量问题。结论：不支持无理由退货。审核：质量问题或其他例外进入人工工单。",
            ),
            (
                f"{chunk_prefix}-installed",
                "已安装商品",
                "已经安装且影响二次销售的商品，需要主管审核，不得口头承诺全额退款。",
            ),
            (
                f"{chunk_prefix}-clearance",
                "特价清仓",
                "特价清仓商品不支持无理由退货，质量问题除外。",
            ),
            (
                f"{chunk_prefix}-refund",
                "退款到账时效",
                "仓库验收通过后按原支付方式退款：原路退回 1～3 个工作日；对公转账 5 个工作日内；礼品卡即时退回余额。对公转账若收款账户与订单主体不一致，需要人工确认。",
            ),
        ]
        if status == "inactive":
            cards = [
                (
                    f"{chunk_prefix}-standard",
                    "普通商品退货（旧版）",
                    "旧规则：退货期限为签收后 15 天。",
                )
            ]
        for chunk_id, section, content in cards:
            if content.strip():
                chunks.append(
                    {
                        "chunk_id": chunk_id,
                        "doc_id": doc_id,
                        "sku": None,
                        "status": status,
                        "source": path.name,
                        "section": section,
                        "content": content.strip(),
                    }
                )
    elif path.name == "usage_guide.md":
        for section_title, content in split_markdown_sections(body):
            if section_title == "全文":
                continue
            sku_match = re.search(r"([A-Z]\d{3})", section_title)
            sku = sku_match.group(1) if sku_match else None
            chunk_id = f"usage-{sku.lower()}" if sku else f"usage-{slugify(section_title)}"
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "sku": sku,
                    "status": status,
                    "source": path.name,
                    "section": section_title,
                    "content": content.strip(),
                }
            )
    elif path.name == "banned_phrases.md":
        cards = [
            (
                "banned-no-promise",
                "禁止口头承诺",
                "客服不得口头承诺“一定给您退款”“保证今天到账”“定制颜色也可以无理由退”“我帮您直接改订单价格”。",
            ),
            (
                "banned-no-fabrication",
                "禁止编造参数",
                "不得把 B205 的尺寸或承重用于 A102；不得把旧版 15 天退货规则当作现行规则；资料中没有的 SKU 不得用相似商品替代。",
            ),
            (
                "banned-system-boundary",
                "系统边界",
                "本知识库只生成客服回复草稿，不直接创建退货单、修改订单金额或向客户发送未经审核的最终承诺。",
            ),
        ]
        for chunk_id, section, content in cards:
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "sku": None,
                    "status": status,
                    "source": path.name,
                    "section": section,
                    "content": content,
                }
            )
    else:
        for section_title, content in split_markdown_sections(body):
            chunk_id = f"{chunk_prefix}-{slugify(section_title)}"
            chunks.append(
                {
                    "chunk_id": chunk_id,
                    "doc_id": doc_id,
                    "sku": None,
                    "status": status,
                    "source": path.name,
                    "section": section_title,
                    "content": content.strip(),
                }
            )

    doc["content_hash"] = sha16("\n\n".join(c["content"] for c in chunks))
    return doc, chunks


def load_test_cases() -> list[dict]:
    rows = list(csv.DictReader(QUESTIONS_CSV.open(encoding="utf-8")))
    return [
        {
            "case_id": row["case_id"],
            "question_type": row["question_type"],
            "question": row["question"],
            "expected_chunk_ids": row["expected_chunk_ids"],
            "expected_action": row["expected_action"],
            "check_point": row["check_point"],
        }
        for row in rows
    ]


def connect(db_path: Path = DB_PATH) -> sqlite3.Connection:
    STORAGE_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def ensure_schema(conn: sqlite3.Connection) -> None:
    enabled = conn.execute(
        "SELECT sqlite_compileoption_used('ENABLE_FTS5')"
    ).fetchone()[0]
    if not enabled:
        raise SystemExit("当前 SQLite 未启用 FTS5。")
    conn.executescript(SCHEMA)


def import_all(db_path: Path = DB_PATH, *, reset: bool = True) -> dict[str, int]:
    if reset and db_path.exists():
        db_path.unlink()

    conn = connect(db_path)
    try:
        ensure_schema(conn)

        documents: list[dict] = []
        chunks: list[dict] = []

        prod_doc, prod_chunks = load_products()
        documents.append(prod_doc)
        chunks.extend(prod_chunks)

        for path, doc_id, prefix in [
            (DATA_DIR / "returns_v1.md", "returns-v1", "returns-inactive"),
            (DATA_DIR / "returns.md", "returns-v2", "returns-active"),
            (DATA_DIR / "usage_guide.md", "usage-v1", "usage"),
            (DATA_DIR / "banned_phrases.md", "banned-v1", "banned"),
        ]:
            doc, doc_chunks = load_markdown(path, doc_id, prefix)
            documents.append(doc)
            chunks.extend(doc_chunks)

        for doc in documents:
            conn.execute(
                """
                INSERT OR REPLACE INTO documents
                (doc_id, title, source, version, status, owner, content_hash, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    doc["doc_id"],
                    doc["title"],
                    doc["source"],
                    doc.get("version"),
                    doc["status"],
                    doc.get("owner"),
                    doc.get("content_hash"),
                    doc.get("notes"),
                ),
            )

        conn.execute("DELETE FROM chunks")
        for chunk in chunks:
            conn.execute(
                """
                INSERT OR REPLACE INTO chunks
                (chunk_id, doc_id, sku, status, source, section, content)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    chunk["chunk_id"],
                    chunk["doc_id"],
                    chunk["sku"],
                    chunk["status"],
                    chunk["source"],
                    chunk["section"],
                    chunk["content"],
                ),
            )

        conn.execute("INSERT INTO chunk_fts(chunk_fts) VALUES('rebuild')")

        conn.execute("DELETE FROM test_cases")
        for case in load_test_cases():
            conn.execute(
                """
                INSERT OR REPLACE INTO test_cases
                (case_id, question_type, question, expected_chunk_ids, expected_action, check_point)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    case["case_id"],
                    case["question_type"],
                    case["question"],
                    case["expected_chunk_ids"],
                    case["expected_action"],
                    case["check_point"],
                ),
            )

        conn.commit()
        return {
            "documents": len(documents),
            "chunks": len(chunks),
            "test_cases": len(load_test_cases()),
        }
    finally:
        conn.close()


if __name__ == "__main__":
    stats = import_all()
    print(f"已导入 → {DB_PATH}")
    for key, value in stats.items():
        print(f"  {key}: {value}")
