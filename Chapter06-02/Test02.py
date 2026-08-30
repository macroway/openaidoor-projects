"""在 embeddings.json 的缓存向量里做相似度检索（课堂离线演示）。"""

from __future__ import annotations

import json
import math
import re
from pathlib import Path

EMBEDDINGS_PATH = Path(__file__).with_name("embeddings.json")
QUERY = "A102 最多能坐多重的人？"
TOP_K = 5


def cosine(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def normalize_text(s: str) -> str:
    s = s.strip().lower()
    s = re.sub(r"[？?！!。．.，,、\s]+", "", s)
    return s


def resolve_query_vector(data: dict, query: str) -> tuple[str, list[float]]:
    """用预计算 questions 向量；更换真实嵌入模型后，这里改为现场 encode(query)。"""
    q_texts = data["texts"]["questions"]
    q_vecs = data["questions"]
    key = normalize_text(query)

    for qid, text in q_texts.items():
        if normalize_text(text) == key:
            return qid, q_vecs[qid]

    raise KeyError(
        f"找不到问题向量: {query!r}\n"
        f"可用问题: {list(q_texts.values())}"
    )


def search(query: str = QUERY, top_k: int = TOP_K) -> tuple[str, list[dict]]:
    data = json.loads(EMBEDDINGS_PATH.read_text(encoding="utf-8"))
    qid, q_vec = resolve_query_vector(data, query)
    chunk_texts = data["texts"]["chunks"]
    chunk_vecs = data["chunks"]

    ranked = []
    for chunk_id, vec in chunk_vecs.items():
        ranked.append(
            {
                "chunk_id": chunk_id,
                "content": chunk_texts[chunk_id],
                "score": cosine(q_vec, vec),
            }
        )
    ranked.sort(key=lambda r: r["score"], reverse=True)
    return qid, ranked[:top_k]


def main() -> None:
    qid, hits = search()
    print(f"查询: {QUERY}")
    print(f"问题向量: {qid}")
    print(f"Top-{len(hits)}:\n")
    for i, row in enumerate(hits, 1):
        print(f"[{i}] chunk_id={row['chunk_id']}  cosine={row['score']:.4f}")
        print(f"    {row['content']}\n")


if __name__ == "__main__":
    main()
