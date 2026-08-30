/**
 * 飞书风格设计令牌。
 * 参考飞书/Lark 表格的视觉语言：浅灰底色、白色卡片、紧凑表格、柔和标签色。
 * 所有组件统一从此文件引用，禁止在组件中硬编码魔法数值。
 */

// ─── 颜色 ──────────────────────────────────────────────
export const color = {
  // 背景
  bgPage:       '#F5F6F7',   // 页面底色（浅灰）
  bgCard:       '#FFFFFF',   // 卡片/容器白色
  bgHeader:     '#FAFBFC',   // 表头/工具栏浅灰
  bgHover:      '#F2F3F5',   // 行/项 hover
  bgActive:     '#E8F3FF',   // 选中/激活态浅蓝

  // 边框
  border:       '#DEE0E3',   // 默认边框
  borderLight:  '#E5E6EB',   // 轻边框（分割线）
  borderFocus:  '#3370FF',   // 聚焦边框

  // 文字
  textPrimary:   '#1D2129',  // 主文字
  textSecondary: '#4E5969',  // 次要文字
  textTertiary:  '#86909C',  // 辅助文字（placeholder、meta）
  textDisabled:  '#C9CDD4',  // 禁用文字
  textInverse:   '#FFFFFF',  // 反色文字（深色背景上）

  // 品牌/主色
  brand:         '#3370FF',  // 飞书蓝（主按钮、链接、激活态）
  brandHover:    '#2860E1',  // 品牌色 hover
  brandLight:    '#E8F3FF',  // 品牌色浅底

  // 功能色
  success:       '#00B42A',  // 成功/完成
  successLight:  '#E8FFEA',  // 成功浅底
  warning:       '#FF7D00',  // 警告/注意
  warningLight:  '#FFF7E8',  // 警告浅底
  danger:        '#F53F3F',  // 危险/错误
  dangerLight:   '#FFECE8',  // 危险浅底
  info:          '#165DFF',  // 信息
  infoLight:     '#E8F3FF',  // 信息浅底

  // 进度条
  progressTrack: '#F2F3F5',  // 进度条轨道
  progressFill:  '#3370FF',  // 进度条填充

  // 上传区域
  uploadBorder:  '#C9CDD4',  // 上传区虚线边框
  uploadHover:   '#3370FF',  // 上传区 hover 边框
  uploadBg:      '#F7F8FA',  // 上传区 hover 背景
  uploadIconBg:  '#F2F3F5',  // 上传区图标背景
};

// ─── 字体 ──────────────────────────────────────────────
export const font = {
  family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans SC", sans-serif',
  size: {
    xs:  12,   // 标签、meta、badge
    sm:  13,   // 次要文字、表头
    base: 14,  // 正文、按钮
    lg:  16,   // 小标题
    xl:  20,   // 页面标题
    xxl: 24,   // 大标题
  },
  weight: {
    regular: 400,
    medium:  500,
    semibold: 600,
    bold:    700,
  },
  lineHeight: {
    tight: 1.3,
    normal: 1.5,
    loose: 1.7,
  },
};

// ─── 间距 ──────────────────────────────────────────────
export const spacing = {
  xxs: 4,
  xs:  8,
  sm:  12,
  md:  16,
  lg:  20,
  xl:  24,
  xxl: 32,
  xxxl: 40,
};

// ─── 圆角 ──────────────────────────────────────────────
export const radius = {
  xs: 4,    // badge、小按钮
  sm: 6,    // 按钮、输入框
  md: 8,    // 卡片、容器
  lg: 12,   // 大卡片（上传区）
  xl: 16,   // 特殊大圆角
  full: 999, // 胶囊形 badge
};

// ─── 阴影 ─────────────────────────────────────────────
export const shadow = {
  none:   'none',
  sm:     '0 1px 2px rgba(0, 0, 0, 0.04)',
  md:     '0 2px 8px rgba(0, 0, 0, 0.06)',
  lg:     '0 4px 16px rgba(0, 0, 0, 0.08)',
};

// ─── 过渡 ──────────────────────────────────────────────
export const transition = {
  fast: '0.15s ease',
  normal: '0.2s ease',
  slow: '0.3s ease',
};

// ─── 紧急度标签配色（飞书风格柔和色） ──────────────────
export const urgencyColors = {
  '普通': { bg: '#F2F3F5', text: '#4E5969' },
  '较急': { bg: '#FFF7E8', text: '#D25F00' },
  '紧急': { bg: '#FFECE8', text: '#CB2634' },
};

// ─── 布尔标签配色 ──────────────────────────────────────
export const boolColors = {
  '是': { bg: '#E8F3FF', text: '#165DFF' },
  '否': { bg: '#FFF7E8', text: '#D25F00' },
};
