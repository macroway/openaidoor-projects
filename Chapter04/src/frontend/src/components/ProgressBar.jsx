/**
 * 进度条组件。
 * 显示处理进度：已处理/总数、百分比、进度条动画。
 */

const styles = {
  container: {
    padding: '24px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    marginTop: 24,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1A1A2E',
  },
  count: {
    fontSize: 14,
    color: '#6B7280',
  },
  track: {
    height: 8,
    background: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    background: 'linear-gradient(90deg, #2DD4A8, #20B2AA)',
    borderRadius: 4,
    transition: 'width 0.4s ease',
  },
  fillPulse: {
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  percent: {
    textAlign: 'right',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
  },
  status: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
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
