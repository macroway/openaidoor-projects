"""关键词检索：入库用 jieba 分词；查询先关键词抽取后再 MATCH。"""

from __future__ import annotations

import json
import re
import sqlite3
from pathlib import Path

import jieba

BASE = Path(__file__).resolve().parent
SEED_PATH = BASE / "chunks_seed.json"
QUERY = "A102 最多能坐多重的人？"

# 与 Test03 一致：先去整词，再去单字，避免问句词污染 MATCH
STOP_PHRASES = (
    "是多少", "请问", "什么", "怎么", "如何", "最多", "能坐", "多重", "多少",
)
STOP_CHARS = set("的了吗呢啊有人坐能重")


def jieba_tokenize(text: str) -> str:
    """jieba 切词后以空格拼接，供 unicode61 FTS 按词检索（入库侧）。"""
    words = []
    for w in jieba.lcut(text):
        w = w.strip()
        if not w or re.fullmatch(r"[\W_]+", w, flags=re.UNICODE):
            continue
        words.append(w)
    return " ".join(words)


def extract_keywords(query: str) -> str:
    """从自然语言问句抽出关键词（查询侧，与 Test03 一致）。"""
    cleaned = query
    for phrase in sorted(STOP_PHRASES, key=len, reverse=True):
        cleaned = cleaned.replace(phrase, " ")

    tokens = re.findall(r"[A-Za-z0-9]+|[\u4e00-\u9fff]+", cleaned)
    kept = []
    for t in tokens:
        if re.fullmatch(r"[A-Za-z0-9]+", t):
            kept.append(t)
            continue
        piece = "".join(c for c in t if c not in STOP_CHARS)
        if len(piece) >= 2:
            kept.append(piece)
    return " ".join(kept)


db = sqlite3.connect(BASE / "rag.db")
db.row_factory = sqlite3.Row

# 每次运行先清空，再重建表。
db.execute("DROP TABLE IF EXISTS chunk_fts")
db.execute("DROP TABLE IF EXISTS chunks")

db.execute("""
CREATE TABLE chunks (
    id INTEGER PRIMARY KEY,
    chunk_id TEXT UNIQUE,
    doc_id TEXT,
    sku TEXT,
    status TEXT,
    source TEXT,
    section TEXT,
    content TEXT
)
""")
db.execute("""
CREATE VIRTUAL TABLE chunk_fts USING fts5(
    content,
    tokenize='unicode61'
)
""")

# 入库：写入原文到 chunks，同时 jieba 分词写入 FTS。
seed = json.loads(SEED_PATH.read_text(encoding="utf-8"))
for item in seed:
    cur = db.execute(
        """
        INSERT INTO chunks (chunk_id, doc_id, sku, status, source, section, content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            item["chunk_id"],
            item.get("doc_id"),
            item.get("sku"),
            item.get("status"),
            item.get("source"),
            item.get("section"),
            item["content"],
        ),
    )
    db.execute(
        "INSERT INTO chunk_fts(rowid, content) VALUES (?, ?)",
        (cur.lastrowid, jieba_tokenize(item["content"] or "")),
    )
db.commit()

# Query 前抽关键词；空格分隔 = FTS5 默认 AND。
match_query = extract_keywords(QUERY)
rows = [
    dict(row)
    for row in db.execute(
        """
        SELECT c.chunk_id, c.content, bm25(chunk_fts) AS bm25_score
        FROM chunk_fts
        JOIN chunks AS c ON c.id = chunk_fts.rowid
        WHERE chunk_fts MATCH ?
        ORDER BY bm25_score
        LIMIT 5
        """,
        (match_query,),
    ).fetchall()
]

print(f"已重建入库: {len(seed)} 条")
print(f"查询: {QUERY}")
print(f"关键词 MATCH: {match_query!r}")
print(f"命中 {len(rows)} 条:")
for i, row in enumerate(rows, 1):
    print(f"\n[{i}] chunk_id={row['chunk_id']}  bm25={row['bm25_score']:.4f}")
    print(row["content"])
