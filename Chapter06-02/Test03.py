"""混合检索：关键词 FTS + 向量余弦相似度，再用 RRF 融合排序。"""

from __future__ import annotations

import json
import math
import re
import sqlite3
from pathlib import Path

BASE = Path(__file__).resolve().parent
DB_PATH = BASE / "rag.db"
EMBEDDINGS_PATH = BASE / "embeddings.json"

QUERY = "A102 最多能坐多重的人？"
TOP_K = 5
RRF_K = 60

# 先去整词，再去单字，避免「最多能坐…」被拆成无意义残片
STOP_PHRASES = (
    "是多少", "请问", "什么", "怎么", "如何", "最多", "能坐", "多重", "多少",
)
STOP_CHARS = set("的了吗呢啊有人坐能重")


def rrf(keyword_rows, vector_rows, k=60):
    scores = {}
    rows_by_id = {}

    for rank, row in enumerate(keyword_rows, start=1):
        chunk_id = row["chunk_id"]
        rows_by_id[chunk_id] = {**rows_by_id.get(chunk_id, {}), **row}
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank)

    for rank, row in enumerate(vector_rows, start=1):
        chunk_id = row["chunk_id"]
        rows_by_id[chunk_id] = {**rows_by_id.get(chunk_id, {}), **row}
        scores[chunk_id] = scores.get(chunk_id, 0) + 1 / (k + rank)

    return sorted(
        ({**rows_by_id[chunk_id], "rrf_score": score}
         for chunk_id, score in scores.items()),
        key=lambda row: row["rrf_score"],
        reverse=True,
    )


def extract_keywords(query: str) -> str:
    """从自然语言问句抽出适合 trigram MATCH 的关键词。"""
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


def keyword_search(query: str, top_k: int = TOP_K) -> list[dict]:
    keywords = extract_keywords(query)
    if not keywords:
        return []

    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    try:
        rows = [
            dict(row)
            for row in db.execute(
                """
                SELECT c.chunk_id, c.content, bm25(chunk_fts) AS bm25_score
                FROM chunk_fts
                JOIN chunks AS c ON c.id = chunk_fts.rowid
                WHERE chunk_fts MATCH ?
                ORDER BY bm25_score
                LIMIT ?
                """,
                (keywords, top_k),
            ).fetchall()
        ]
    except sqlite3.OperationalError:
        rows = []
    finally:
        db.close()
    return rows


def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def normalize_text(s: str) -> str:
    s = s.strip().lower()
    return re.sub(r"[？?！!。．.，,、\s]+", "", s)


def resolve_query_vector(data: dict, query: str) -> list[float]:
    q_texts = data["texts"]["questions"]
    q_vecs = data["questions"]
    key = normalize_text(query)
    for qid, text in q_texts.items():
        if normalize_text(text) == key:
            return q_vecs[qid]
    raise KeyError(f"找不到问题向量: {query!r}")


def vector_search(query: str, top_k: int = TOP_K) -> list[dict]:
    data = json.loads(EMBEDDINGS_PATH.read_text(encoding="utf-8"))
    q_vec = resolve_query_vector(data, query)
    chunk_texts = data["texts"]["chunks"]

    ranked = [
        {
            "chunk_id": chunk_id,
            "content": chunk_texts[chunk_id],
            "cosine_score": cosine(q_vec, vec),
        }
        for chunk_id, vec in data["chunks"].items()
    ]
    ranked.sort(key=lambda r: r["cosine_score"], reverse=True)
    return ranked[:top_k]


def print_rows(title: str, rows: list[dict], score_key: str) -> None:
    print(f"\n=== {title}（{len(rows)} 条）===")
    if not rows:
        print("(无命中)")
        return
    for i, row in enumerate(rows, 1):
        score = row.get(score_key)
        score_s = f"{score:.6f}" if isinstance(score, float) else score
        print(f"[{i}] {row['chunk_id']}  {score_key}={score_s}")
        print(f"    {row['content']}")


def main() -> None:
    keywords = extract_keywords(QUERY)
    print(f"查询: {QUERY}")
    print(f"关键词 MATCH: {keywords!r}")

    keyword_rows = keyword_search(QUERY)
    vector_rows = vector_search(QUERY)
    hybrid_rows = rrf(keyword_rows, vector_rows, k=RRF_K)[:TOP_K]

    print_rows("关键词检索", keyword_rows, "bm25_score")
    print_rows("向量检索", vector_rows, "cosine_score")
    print_rows("混合检索 RRF", hybrid_rows, "rrf_score")


if __name__ == "__main__":
    main()
