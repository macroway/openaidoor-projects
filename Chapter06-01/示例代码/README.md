# 格式解析、清洗与切分：底层拆解示例（可选）

第六章的主线工具已经改为 Docling。这份脚本不再承担主线教学，而是作为可选的“底层拆解”材料：帮助学员观察 PDF 页面、Word 正文节点和 Excel 单元格究竟是怎样被程序读取的。

它不使用 LangChain、LlamaIndex 或向量数据库，分别调用 `pdfplumber`、`python-docx` 和 `openpyxl`，直接处理第六章提供的三份样例：

- `恒温设备维护手册.pdf`
- `客户服务处理制度.docx`
- `产品故障案例.xlsx`

## 运行

在 Qoder 中打开终端，进入本目录后执行：

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python rag_prepare.py
```

Windows 激活虚拟环境时使用：

```powershell
.venv\Scripts\activate
```

脚本会生成：

```text
运行结果/
├── 01_直接解析/
│   ├── pdf.json
│   ├── docx.json
│   └── xlsx.json
├── 02_清洗后/
│   ├── pdf.md
│   ├── docx.md
│   └── xlsx_records.json
└── 03_切分后/
    ├── fixed_chunks.jsonl
    ├── heading_chunks.jsonl
    └── record_chunks.jsonl
```

课堂上不要只看最终的 `jsonl`。应依次打开三个目录，对照原始文件观察信息是在哪一步丢失、恢复或被切开的。

## 这份代码的边界

- PDF 示例只覆盖文本型 PDF；扫描件需要另加 OCR。
- DOCX 示例读取正文段落、列表和表格，不覆盖文本框、批注及修订。
- XLSX 示例通过“案例编号”识别表头，实际项目应把主键和表头规则做成配置。
- 固定长度切分用于对比；手册优先按标题切，表格优先按行记录切。
