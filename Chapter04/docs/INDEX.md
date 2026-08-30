# 文档目录与阅读顺序

本目录集中存放经过确认的设计文档。请按以下顺序阅读。

---

## 阅读顺序

| 序号 | 文档 | 文件 | 说明 |
|------|------|------|------|
| 1 | 产品需求文档（PRD） | [PRD-微信客户询价整理工具.md](./PRD-微信客户询价整理工具.md) | 产品目标、功能范围、输入输出、验收标准 |
| 2 | 技术方案 | [技术方案-微信客户询价整理工具MVP.md](./技术方案-微信客户询价整理工具MVP.md) | 技术栈、模块结构、数据流、异常处理、实现计划 |
| 3 | UI 设计稿 — 工作台 | [workspace-upload.html](./workspace-upload.html) | 上传页面设计稿，可直接在浏览器打开 |
| 4 | UI 设计稿 — 结果页 | [workspace-results.html](./workspace-results.html) | 结果页表格设计稿，可直接在浏览器打开 |
| 5 | 落地页方案 A | [landing-A-warm-flow.html](./landing-A-warm-flow.html) | 暖色调风格落地页（参考，MVP 暂不实现） |
| 6 | 落地页方案 B | [landing-B-clean-product.html](./landing-B-clean-product.html) | 简洁产品风格落地页（参考，MVP 暂不实现） |
| 7 | 落地页方案 C | [landing-C-story-compare.html](./landing-C-story-compare.html) | 故事对比风格落地页（参考，MVP 暂不实现） |

---

## 文档说明

- **PRD** 定义了做什么、不做什么、验收标准。所有实现以 PRD 为准。
- **技术方案** 定义了怎么做，包含 8 步实现计划。代码结构和模块划分以技术方案第 3 节为准。
- **UI 设计稿**（workspace-upload.html、workspace-results.html）是前端页面的视觉参考，实现时应尽量还原。
- **落地页**（landing-*.html）为产品展示页方案，MVP 阶段不实现，留作后续参考。

---

## 尚未存在的文档

| 文档 | 状态 | 说明 |
|------|------|------|
| API 接口文档 | 暂无 | FastAPI 自带 Swagger 文档，无需额外维护 |
| Prompt 模板文档 | 暂无 | 将在 `backend/prompts/extract_prompt.py` 中维护 |
| 部署说明 | 暂无 | 将在 `docker-compose.yml` 和 `.env.example` 中体现 |
