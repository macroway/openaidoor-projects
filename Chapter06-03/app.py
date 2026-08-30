#!/usr/bin/env python3
"""本地四区界面：问题、草稿、证据、反馈。"""

from __future__ import annotations

import json
import sqlite3
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from kb.import_docs import DB_PATH, connect
from kb.search import draft_from_evidence, search

HOST = "127.0.0.1"
PORT = 8765
WEB_DIR = Path(__file__).resolve().parent / "web"


def save_feedback(question: str, verdict: str, comment: str = "") -> None:
    conn = connect(DB_PATH)
    try:
        conn.execute(
            "INSERT INTO feedback (question, verdict, comment) VALUES (?, ?, ?)",
            (question, verdict, comment),
        )
        conn.commit()
    finally:
        conn.close()


HTML = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>商品与售后知识库 · 客服草稿</title>
  <style>
    :root { --bg:#f7f4f0; --paper:#fff; --ink:#2d2a26; --muted:#6b6560; --accent:#b85042; --line:#e2ddd6; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: "PingFang SC", sans-serif; background:var(--bg); color:var(--ink); }
    header { background:var(--accent); color:#fff; padding:16px 24px; }
    main { display:grid; grid-template-columns:1fr 1fr; gap:16px; padding:16px 24px 24px; }
    section { background:var(--paper); border:1px solid var(--line); border-radius:10px; padding:16px; min-height:220px; }
    h2 { margin:0 0 12px; font-size:16px; }
    textarea, input { width:100%; font:inherit; border:1px solid var(--line); border-radius:8px; padding:10px; }
    textarea { min-height:120px; resize:vertical; }
    button { margin-top:8px; margin-right:8px; padding:8px 14px; border:none; border-radius:8px; background:var(--accent); color:#fff; cursor:pointer; }
    button.secondary { background:#8a8a8a; }
    .evidence { border-top:1px solid var(--line); padding-top:10px; margin-top:10px; font-size:14px; }
    .meta { color:var(--muted); font-size:12px; margin-bottom:6px; }
    pre { white-space:pre-wrap; font-family:inherit; margin:0; }
    footer { padding:0 24px 24px; color:var(--muted); font-size:13px; }
  </style>
</head>
<body>
  <header>
    <h1 style="margin:0;font-size:20px;">商品与售后知识库 · 只生成客服草稿</h1>
    <p style="margin:6px 0 0;opacity:.9;font-size:14px;">检索 SQLite + BM25，证据必须显示原文</p>
  </header>
  <main>
    <section>
      <h2>1. 问题输入</h2>
      <form id="ask-form">
        <textarea id="question" placeholder="例如：A102 的静态承重是多少"></textarea>
        <button type="submit">检索并生成草稿</button>
      </form>
    </section>
    <section>
      <h2>2. 回答草稿</h2>
      <pre id="draft">提交问题后显示草稿…</pre>
    </section>
    <section style="grid-column:1 / span 2;">
      <h2>3. 证据列表</h2>
      <div id="evidence">暂无</div>
    </section>
    <section style="grid-column:1 / span 2;">
      <h2>4. 反馈</h2>
      <form id="feedback-form">
        <input type="hidden" id="fb-question" />
        <button type="button" data-verdict="采纳">采纳</button>
        <button type="button" data-verdict="需修改" class="secondary">需修改</button>
        <button type="button" data-verdict="错误" class="secondary">错误</button>
        <textarea id="fb-comment" placeholder="可选：说明哪里需要改"></textarea>
      </form>
      <p id="fb-status" class="meta"></p>
    </section>
  </main>
  <footer>第六章第三节实战 · 无 API Key 时使用模板草稿；有 Key 时可替换 kb/search.py 中的 draft 逻辑。</footer>
  <script>
    const askForm = document.getElementById('ask-form');
    const fbForm = document.getElementById('feedback-form');
    askForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const question = document.getElementById('question').value.trim();
      if (!question) return;
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({question})
      });
      const data = await res.json();
      document.getElementById('draft').textContent = data.draft;
      document.getElementById('fb-question').value = question;
      document.getElementById('evidence').innerHTML = data.evidence.map((item, i) => `
        <div class="evidence">
          <div class="meta">#${i+1} · ${item.source} · ${item.section} · ${item.chunk_id}</div>
          <pre>${item.content}</pre>
        </div>`).join('') || '<p class="meta">未找到证据</p>';
    });
    fbForm.querySelectorAll('button[data-verdict]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const question = document.getElementById('fb-question').value;
        const verdict = btn.dataset.verdict;
        const comment = document.getElementById('fb-comment').value;
        await fetch('/api/feedback', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({question, verdict, comment})
        });
        document.getElementById('fb-status').textContent = `已记录反馈：${verdict}`;
      });
    });
  </script>
</body>
</html>
"""


class Handler(BaseHTTPRequestHandler):
    def _json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path in ("/", "/index.html"):
            content = HTML.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return
        self.send_error(404)

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length).decode("utf-8")
        data = json.loads(raw) if raw else {}

        if self.path == "/api/ask":
            question = (data.get("question") or "").strip()
            evidence = search(question, top_k=5)
            draft = draft_from_evidence(question, evidence)
            self._json({"question": question, "draft": draft, "evidence": evidence})
            return

        if self.path == "/api/feedback":
            save_feedback(
                question=data.get("question", ""),
                verdict=data.get("verdict", "未知"),
                comment=data.get("comment", ""),
            )
            self._json({"ok": True})
            return

        self.send_error(404)


def main() -> None:
    if not DB_PATH.exists():
        raise SystemExit(f"请先运行: python -m kb.import_docs  （缺少 {DB_PATH}）")
    server = HTTPServer((HOST, PORT), Handler)
    print(f"打开 http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
