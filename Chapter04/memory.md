# memory.md — 项目记忆

> 只记录经过本项目材料或用户确认的事实。决定发生变化时，记录新决定和变化原因。

---

## 1. 已确认的设计偏好和项目约束

- 产品名：询价整理助手（WeChat Inquiry Parser）
- 产品形态：本地部署的网页工具，通过 Docker 一键启动
- 技术栈：Python 3.11+ / FastAPI / React + Vite / 豆包视觉 API / openpyxl
- AI 模型：豆包视觉模型（doubao-vision-pro-32k-241028），OpenAI 兼容接口
- 数据存储：纯内存，不使用数据库，进程重启数据丢失
- 前端状态管理：React 内置 state，不引入 Redux/Zustand
- 进度通知：HTTP 轮询（每 2 秒），不引入 WebSocket
- 部署方式：docker-compose，前端 Nginx 托管 + 反向代理
- 输出格式：双 Sheet Excel（询价整理表 + 人工确认问题）
- MVP 用户：单人本地使用，无需登录认证

---

## 2. 曾经错误、后来被修正的假设

| 错误假设 | 实际情况 | 修正 |
|---------|---------|------|
| Nginx 默认允许大文件上传 | 默认 `client_max_body_size` 仅 1MB，图片上传被 413 拒绝 | nginx.conf 中添加 `client_max_body_size 50M;` |
| AI 模型严格按 Prompt 返回字符串类型 | doubao-seed-2-0-lite 模型可能返回 int/float（如 `quantity: 100`） | InquiryRecord 添加 `field_validator` 自动将非字符串值转为 str |
| Docker Hub 可从阿里云服务器直接访问 | 国内服务器无法直连 Docker Hub | 配置镜像加速器（docker.m.daocloud.io）|

---

## 3. 已推翻或拒绝的设计模式

| 被拒绝的方案 | 拒绝原因 |
|-------------|---------|
| 数据库持久化（SQLite/PostgreSQL） | MVP 单用户单次会话，无需持久化，增加复杂度 |
| 消息队列 | 单用户本地部署，无并发压力 |
| Redux/Zustand 状态管理 | 数据量小，React useState 足够 |
| WebSocket 实时推送 | MVP 场景简单，轮询足够，减少复杂度 |
| 微服务/多容器编排 | 单体应用即可满足 |

---

## 4. 后续工作必须遵守的规范与约定

- API 路径统一以 `/api/` 为前缀
- 后端端口 8000，前端端口 3000
- API Key 通过 .env 文件传入，不硬编码，不提交 Git
- AI 调用走 HTTPS，图片以 base64 传入
- Prompt 模板外置在 src/backend/prompts/extract_prompt.py，方便调优
- 截图临时文件存于 /tmp/uploads/{task_id}/，任务结束后清理
- 前端构建产物由 Docker 在构建阶段生成
- 紧急度取值：普通 / 较急 / 紧急
- 数量字段准确率要求 >= 99%（最高优先级）
- 去重/矛盾消解准确率 >= 98%
- 测试截图不应包含真实客户隐私信息

---

## 5. 仍未决定的问题

| 问题 | 何时决定 |
|------|--------|
| Prompt 最终版本 | 持续根据 AI 解析效果调优 |
| 截图分组策略（AI 识别 vs 用户手动） | 待验证 AI 识别准确率后决定 |
| 紧急度判断标准细化 | 待初始实现后根据效果决定 |

---

## 6. 云端部署记录（2026-08-10 验证）

- 服务器：阿里云 ECS，Alibaba Cloud Linux 4.0.4 LTS 64位
- 项目目录：`/opt/inquiry-parser`
- 访问地址：`http://<公网IP>:3000`（端口 3000，Nginx 入口）
- 后端 8000 端口不对外开放，仅通过 Nginx 代理访问
- Docker 镜像加速：docker.m.daocloud.io（配置在 /etc/docker/daemon.json）
- 部署命令：`cd /opt/inquiry-parser && docker compose -f docker-compose.prod.yml up --build -d`
- 服务器重启后需手动执行上述命令恢复服务
- 详细文档见 `docs/deployment.md`
