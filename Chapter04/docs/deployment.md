# 部署文档：微信客户询价整理工具

## 服务器信息

| 项目 | 值 |
|------|------|
| 操作系统 | Alibaba Cloud Linux 4.0.4 LTS 64位 |
| 项目目录 | `/opt/inquiry-parser` |
| 前端入口端口 | 3000（Nginx 托管静态文件 + 代理 /api 到后端） |
| 后端端口 | 8000（仅容器内部访问，不对外开放） |
| 访问地址 | `http://47.113.186.116:3000` |
| Docker 版本 | 24.0.9 |
| Docker Compose 版本 | 2.26.1（插件模式） |

## 环境变量

环境变量存放在 `/opt/inquiry-parser/.env`，由 `docker-compose.prod.yml` 自动加载。

| 配置项 | 说明 | 必填 |
|--------|------|------|
| DOUBAO_API_KEY | 豆包视觉模型 API Key | 是 |
| DOUBAO_MODEL | 模型名称 | 否（默认 doubao-vision-pro-32k-241028） |
| AI_CONCURRENCY | AI 并发调用数 | 否（默认 3） |
| MAX_FILE_SIZE | 单文件最大 MB | 否（默认 10） |

## 常用命令

### 启动服务

```bash
cd /opt/inquiry-parser
docker compose -f docker-compose.prod.yml up -d
```

### 停止服务

```bash
cd /opt/inquiry-parser
docker compose -f docker-compose.prod.yml down
```

### 查看状态

```bash
cd /opt/inquiry-parser
docker compose -f docker-compose.prod.yml ps
```

### 查看日志

```bash
# 查看所有服务日志（实时跟踪）
cd /opt/inquiry-parser
docker compose -f docker-compose.prod.yml logs -f

# 只查看后端日志（最近 50 行）
docker compose -f docker-compose.prod.yml logs --tail=50 backend

# 只查看前端日志
docker compose -f docker-compose.prod.yml logs --tail=50 frontend
```

### 重启服务

```bash
cd /opt/inquiry-parser
docker compose -f docker-compose.prod.yml restart
```

### 重新构建并启动（代码更新后）

```bash
cd /opt/inquiry-parser
# 重建全部
docker compose -f docker-compose.prod.yml up --build -d

# 只重建后端
docker compose -f docker-compose.prod.yml up --build -d backend

# 只重建前端
docker compose -f docker-compose.prod.yml up --build -d frontend
```

### 健康检查

```bash
curl http://localhost:3000/api/health
# 预期返回: {"status":"ok"}
```

## 测试记录

### 端到端测试（2026-08-10）

| 测试项 | 结果 |
|--------|------|
| 上传 6 张测试样例图片（test_samples/0001-0006.png） | 通过 |
| AI 解析处理（6 张图片，约 3 分钟） | 通过 |
| 解析结果：7 条询价记录 + 5 条人工确认 | 通过 |
| 导出 Excel（双 Sheet） | 通过，文件大小 7766 bytes |
| 停止/启动/重启服务 | 通过 |
| 公网访问（端口 3000） | 通过 |

## 服务器重启后恢复

Docker 服务已设为开机自启（`systemctl enable docker`），但容器本身不会自动启动。服务器重启后需要手动执行：

```bash
cd /opt/inquiry-parser
docker compose -f docker-compose.prod.yml up -d
```

等待约 10 秒后验证：

```bash
curl http://localhost:3000/api/health
```

## 本节未配置的内容

以下内容在本节中**未配置**，后续需要时再添加：

| 项目 | 说明 |
|------|------|
| **域名** | 当前通过 IP + 端口访问，未绑定域名 |
| **HTTPS** | 未配置 SSL 证书和加密传输 |
| **进程守护** | 未使用 systemd 管理容器；容器 `restart: unless-stopped` 策略可在 Docker 服务运行时自动恢复，但 Docker 本身未设为系统服务依赖 |
| **自动恢复** | 服务器重启后需手动执行 `docker compose up -d` |
| **日志轮转** | 使用 Docker 默认日志驱动，未配置大小限制和轮转 |
| **数据备份** | 解析结果在内存中，进程重启即丢失 |

## 部署过程中的修复

| 问题 | 修复 |
|------|------|
| Nginx 默认 `client_max_body_size` 为 1MB，导致上传图片被 413 拒绝 | 在 `nginx.conf` 中添加 `client_max_body_size 50M;` |
| AI 模型返回 `quantity` 为整数类型，Pydantic 验证失败 | 在 `InquiryRecord` 模型中添加 `field_validator` 将 int/float 自动转为 str |
