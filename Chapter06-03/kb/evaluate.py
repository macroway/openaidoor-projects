"""召回层评测：Recall@5 与 MRR。"""

from __future__ import annotations

import sqlite3
import uuid
from pathlib import Path

from kb.import_docs import connect, load_test_cases
from kb.search import search

DB_PATH = Path(__file__).resolve().parent.parent / "storage" / "knowledge.db"


def reciprocal_rank(rank: int | None) -> float:
    if rank is None:
        return 0.0
    return 1.0 / rank


def evaluate_retrieval(
    *,
    strategy: str = "fts5-bm25-active",
    top_k: int = 8,
    db_path: Path = DB_PATH,
) -> dict:
    cases = load_test_cases()
    conn = connect(db_path)
    run_id = uuid.uuid4().hex[:12]

    recall_hits = 0
    mrr_total = 0.0
    evaluated = 0
    details: list[dict] = []

    try:
        for case in cases:
            expected = [
                x.strip()
                for x in case["expected_chunk_ids"].split(";")
                if x.strip()
            ]
            if not expected:
                # 无资料题不参与召回层 Recall/MRR
                continue

            hits = search(case["question"], top_k=top_k, db_path=db_path)
            hit_ids = [h["chunk_id"] for h in hits]

            recall_hit = 1 if all(cid in hit_ids for cid in expected) else 0

            best_rank = None
            for chunk_id in expected:
                if chunk_id in hit_ids:
                    rank = hit_ids.index(chunk_id) + 1
                    if best_rank is None or rank < best_rank:
                        best_rank = rank
            rr = reciprocal_rank(best_rank)
            recall_hits += recall_hit
            mrr_total += rr
            evaluated += 1

            detail = {
                "case_id": case["case_id"],
                "question": case["question"],
                "expected_chunk_ids": expected,
                "hit_ids": hit_ids,
                "recall_hit": recall_hit,
                "reciprocal_rank": rr,
                "best_rank": best_rank,
            }
            details.append(detail)

            conn.execute(
                """
                INSERT INTO evaluation_runs
                (run_id, case_id, strategy, recall_hit, reciprocal_rank, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    run_id,
                    case["case_id"],
                    strategy,
                    recall_hit,
                    rr,
                    f"top_k={top_k}; hits={','.join(hit_ids)}",
                ),
            )

        conn.commit()
    finally:
        conn.close()

    recall_at_k = recall_hits / evaluated if evaluated else 0.0
    mrr = mrr_total / evaluated if evaluated else 0.0

    return {
        "run_id": run_id,
        "strategy": strategy,
        "top_k": top_k,
        "evaluated_cases": evaluated,
        "recall_at_k": round(recall_at_k, 4),
        "mrr": round(mrr, 4),
        "details": details,
    }


def print_report(report: dict) -> None:
    print(f"run_id: {report['run_id']}")
    print(f"strategy: {report['strategy']}  top_k={report['top_k']}")
    print(f"Recall@{report['top_k']}: {report['recall_at_k']:.2%}")
    print(f"MRR: {report['mrr']:.4f}")
    print()
    failed = [d for d in report["details"] if d["recall_hit"] == 0]
    if failed:
        print("未命中 Top-K 的题：")
        for item in failed:
            print(f"  {item['case_id']}  期望 {item['expected_chunk_ids']}  实际 {item['hit_ids']}")
    else:
        print("全部有标准证据的题均进入 Top-K。")


if __name__ == "__main__":
    report = evaluate_retrieval()
    print_report(report)
