---
version: alpha
name: 询价整理助手设计系统
description: 微信客户询价整理工具的前端设计系统，覆盖颜色、字体、间距、圆角和组件令牌。
colors:
  primary: "#2DD4A8"
  on-primary: "#ffffff"
  primary-dark: "#20B2AA"
  primary-light: "#ECFDF5"
  ink: "#1A1A2E"
  text-secondary: "#6B7280"
  text-muted: "#9CA3AF"
  text-body: "#4B5563"
  text-heading: "#374151"
  success: "#059669"
  success-light: "#F0FDF9"
  danger: "#EF4444"
  danger-strong: "#DC2626"
  danger-light: "#FEE2E2"
  warning: "#D97706"
  warning-light: "#FEF3C7"
  surface-card: "#F9FAFB"
  surface-badge: "#F3F4F6"
  hairline: "#E5E7EB"
  hairline-light: "#F3F4F6"
  canvas: "#ffffff"
  disabled: "#D1D5DB"
typography:
  display-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 26px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0px
  heading-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 24px
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: 0px
  heading-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0px
  heading-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0px
  body-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0px
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0px
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 13px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0px
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans SC, sans-serif"
    fontSize: 12px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0px
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 40px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-primary-disabled:
    backgroundColor: "{colors.disabled}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  icon-btn:
    backgroundColor: "transparent"
    textColor: "{colors.disabled}"
    rounded: "{rounded.sm}"
    size: 28px
  card:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.lg}"
  table-base:
    backgroundColor: "{colors.canvas}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
  badge-default:
    backgroundColor: "{colors.surface-badge}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
  badge-warning:
    backgroundColor: "{colors.warning-light}"
    textColor: "{colors.warning}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
  badge-danger:
    backgroundColor: "{colors.danger-light}"
    textColor: "{colors.danger-strong}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
  badge-success:
    backgroundColor: "{colors.success-light}"
    textColor: "{colors.success}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
  text-input-editable:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.text-body}"
    typography: "{typography.body-md}"
---

## Overview

询价整理助手是一款面向外贸业务员的微信聊天截图询价提取工具。设计风格为**简洁专业、清爽高效**，以白色为底、绿色为品牌主色，强调数据可读性和操作效率。

## Colors

### 品牌色
- `{colors.primary}` `#2DD4A8` — 主操作按钮、进度条、Tab 激活态
- `{colors.primary-dark}` `#20B2AA` — 品牌色深色变体（渐变终点）
- `{colors.primary-light}` `#ECFDF5` — 品牌色浅底（上传区 hover、成功态背景）

### 文字色
- `{colors.ink}` `#1A1A2E` — 主标题、强调文字
- `{colors.text-heading}` `#374151` — 表头文字
- `{colors.text-body}` `#4B5563` — 正文、表格内容
- `{colors.text-secondary}` `#6B7280` — 副标题、辅助信息
- `{colors.text-muted}` `#9CA3AF` — 占位文字、空状态

### 语义色
- `{colors.success}` `#059669` — 成功状态、数量高亮、追问建议
- `{colors.danger}` `#EF4444` — 错误提示、删除 hover
- `{colors.danger-strong}` `#DC2626` — 问题标注、紧急标签
- `{colors.warning}` `#D97706` — 缺失信息、较急标签

### 表面与边框
- `{colors.canvas}` `#FFFFFF` — 页面/卡片背景
- `{colors.surface-card}` `#F9FAFB` — 表头背景
- `{colors.surface-badge}` `#F3F4F6` — Badge 背景、缩略图背景
- `{colors.hairline}` `#E5E7EB` — 卡片边框、表头底线
- `{colors.hairline-light}` `#F3F4F6` — 表格行底线
- `{colors.disabled}` `#D1D5DB` — 禁用态、拖拽区边框

## Typography

字体栈：系统默认字体，中文回退 Noto Sans SC。

| 级别 | 大小 | 字重 | 用途 |
|------|------|------|------|
| `{typography.display-lg}` | 26px | 800 | 工作台页面标题 |
| `{typography.heading-lg}` | 24px | 800 | 结果页标题 |
| `{typography.heading-md}` | 18px | 700 | 上传区标题 |
| `{typography.heading-sm}` | 16px | 700 | 区块标题（文件列表） |
| `{typography.body-lg}` | 15px | 600 | 进度条标题、副标题 |
| `{typography.body-md}` | 14px | 400 | 正文、表格内容 |
| `{typography.body-sm}` | 13px | 600 | 表头、Badge、状态文字 |
| `{typography.caption}` | 12px | 600 | 文件大小、辅助信息 |

## Layout

- 工作台最大宽度：960px
- 结果页最大宽度：1200px
- 页面水平 padding：24px
- 区块间距：24-32px

## Shapes

圆角使用层级递进：
- `{rounded.sm}` 6px — 小元素（Badge、小按钮）
- `{rounded.md}` 8px — 中等元素（按钮、文件项）
- `{rounded.lg}` 12px — 卡片、表格容器
- `{rounded.xl}` 16px — 上传区域

## Components

### Button（按钮）
- **主按钮** `{components.button-primary}`：品牌色背景、白色文字、圆角 lg
- **禁用态** `{components.button-primary-disabled}`：灰色背景
- **轮廓按钮** `{components.button-outline}`：透明背景、灰色文字、灰色边框
- Hover：主按钮加深、轮廓按钮背景变灰
- 共享组件：`src/components/Button.jsx`

### IconButton（图标按钮）
- `{components.icon-btn}`：28×28px、透明背景、灰色图标
- Hover：浅红背景、红色图标（删除语义）
- 共享组件：`src/components/IconButton.jsx`

### Badge（标签）
- `{components.badge-default}`：灰底灰字 — 普通标签
- `{components.badge-warning}`：黄底黄字 — 较急、待确认
- `{components.badge-danger}`：红底红字 — 紧急
- `{components.badge-success}`：绿底绿字 — 成功、待处理
- 共享组件：`src/components/Badge.jsx`

### Card（卡片）
- `{components.card}`：白色背景、灰色边框、圆角 lg、overflow hidden
- 用于表格容器、上传区、进度条

### Table（表格）
- `{components.table-base}`：全宽、折叠边框
- 表头：`{colors.surface-card}` 背景、`{typography.body-sm}` 字重 700、底部 2px 边框
- 单元格：底部 1px 边框、顶部对齐
- 可编辑单元格：hover 时 `{colors.success-light}` 背景
- 组件：`src/components/InquiryTable.jsx`、`src/components/ConfirmTable.jsx`

### EmptyState（空状态）
- 居中文字、灰色、可选图标
- 共享组件：`src/components/EmptyState.jsx`

## Do's and Don'ts

### Do
- 使用语义令牌名（`text-ink`、`bg-brand`、`border-border`）而非原始色值
- 新组件优先复用已有的共享组件（Button、IconButton、Badge、EmptyState）
- 表格统一使用 `table-base`、`table-th`、`table-td` 类
- 圆角按层级递进：小元素 sm → 中元素 md → 大卡片 lg

### Don't
- 不要在组件中使用硬编码的 hex 色值
- 不要使用 `onMouseEnter`/`onMouseLeave` 手动设置样式，使用 CSS `:hover`
- 不要为同类容器使用不同的 border-radius 值
- 不要创建新的按钮样式，使用已有的 Button 组件 variant

## Known Gaps

- **响应式设计**：尚未添加移动端断点，当前仅桌面端
- **暗色模式**：令牌系统已就绪但尚未定义暗色变量
- **Focus 状态**：缺少键盘导航的 focus-visible 样式
- **ARIA 标注**：部分交互元素缺少无障碍标签
- **Loading 状态**：按钮 loading 状态尚未标准化
