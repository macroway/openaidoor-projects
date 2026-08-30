# 第六章第三节 · 商品与售后知识库

轻量 RAG 实战项目：从原始 CSV / Markdown 导入 SQLite，用 FTS5 + BM25 检索，生成带引用的客服草稿，并用 30 道冻结题做召回评测。

## 项目结构

```text
实战项目/
├── data/                    # 原始资料（可编辑、可版本管理）
│   ├── products.csv
│   ├── returns_v1.md        # inactive · 15 天旧规
│   ├── returns.md           # active · 现行制度
│   ├── usage_guide.md
│   └── banned_phrases.md
├── tests/
│   └── questions.csv        # 30 道冻结测试题
├── storage/
│   └── knowledge.db         # 运行 import 后生成
├── kb/
│   ├── import_docs.py       # 导入与切分
│   ├── search.py            # FTS5 检索 + 模板草稿
│   └── evaluate.py          # Recall@5 / MRR
└── app.py                   # 四区 Web 界面
```

## 快速开始

```bash
cd RAW/Docs/推开AI世界的门_codex/assets/第六章/实战项目

# 1. 导入原始资料 → storage/knowledge.db
python -m kb.import_docs

# 2. 跑召回层评测（无需 API Key）
python -m kb.evaluate

# 3. 打开四区界面：问题 / 草稿 / 证据 / 反馈
python app.py
# 浏览器访问 http://127.0.0.1:8765
```

## 第一个检查点（只导入和检索）

| 问题 | 应命中 chunk |
| --- | --- |
| A102 的静态承重是多少 | `product-a102` |
| 云朵椅应该怎样清洁 | `product-a102` |
| 定制颜色能否无理由退货 | `returns-active-custom` |
| 当前退货期限是多少 | `returns-active-standard` |
| C999 的尺寸是多少 | 无（拒答） |

命令行试查：

```bash
python - <<'PY'
from kb.search import search
for q in [
    "A102 静态承重",
    "云朵椅 清洁",
    "定制颜色 无理由退货",
    "当前 退货期限",
    "C999 尺寸",
]:
    hits = search(q, top_k=3)
    print(q, "->", [h["chunk_id"] for h in hits] or "(无)")
PY
```

## 第二个检查点（草稿 + 反馈）

`app.py` 提供四个区域。证据列表显示**原文片段**，不只显示文件名。无 API Key 时使用模板草稿；接入 LLM 时替换 `kb/search.py` 中的 `draft_from_evidence`。

## 评测集

`tests/questions.csv` 共 30 题：

| 类型 | 数量 |
| --- | --- |
| 直接有答案 | 10 |
| 换一种说法 | 5 |
| 条件与例外 | 4 |
| 无资料答案 | 4 |
| 旧版本或冲突 | 3 |
| 跨文档问题 | 2 |
| 越权请求 | 2 |

字段：`case_id`, `question_type`, `question`, `expected_chunk_ids`, `expected_action`, `check_point`

## 与第二节演示文件的区别

| 文件 | 用途 |
| --- | --- |
| 上级目录 `rag.db` | 第二节 FTS / 向量课堂演示 |
| 本目录 `storage/knowledge.db` | 第三节完整实战项目 |

## 重复导入

```bash
python -m kb.import_docs
```

会清空并重建 `chunks` 与 FTS 索引，按内容哈希更新 `documents`，不产生重复片段。
