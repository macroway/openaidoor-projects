/**
 * 进度条组件。
 * 显示处理进度：已处理/总数、百分比、进度条动画。
 */
import { color, font, spacing, radius, transition } from '../styles/tokens';

const styles = {
  container: {
    padding: spacing.xl,
    background: color.bgCard,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    marginTop: spacing.xl,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: font.size.sm,
    fontWeight: font.weight.medium,
    color: color.textPrimary,
  },
  count: {
    fontSize: font.size.base,
    color: color.textSecondary,
  },
  track: {
    height: 6,
    background: color.progressTrack,
    borderRadius: radius.xs,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: `linear-gradient(90deg, ${color.brand}, #5C8AFF)`,
    borderRadius: radius.xs,
    transition: `width ${transition.slow}`,
  },
  fillPulse: {
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  percent: {
    textAlign: 'right',
    fontSize: font.size.sm,
    color: color.textSecondary,
    marginTop: spacing.xxs,
  },
  status: {
    fontSize: font.size.sm,
    color: color.textTertiary,
    marginTop: spacing.xs,
  },
};

function ProgressBar({ processed, total, status }) {
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
  const currentImage = Math.min(processed + 1, total);

  const statusText = {
    pending: '等待处理...',
    processing: `正在解析第 ${currentImage} / ${total} 张截图...`,
    completed: `解析完成！共 ${total} 张`,
    failed: '处理失败',
  }[status] || '处理中...';

  const showPulse = status === 'processing';

  return (
    <div style={styles.container}>
      <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }`}</style>
      <div style={styles.header}>
        <span style={styles.title}>正在整理</span>
        <span style={styles.count}>{processed} / {total} 张</span>
      </div>
      <div style={styles.track}>
        <div style={{
          ...styles.fill,
          width: `${Math.max(progress, 5)}%`,
          ...(showPulse ? styles.fillPulse : {}),
        }} />
      </div>
      <div style={styles.percent}>{progress}%</div>
      <div style={styles.status}>{statusText}</div>
    </div>
  );
}

export default ProgressBar;
