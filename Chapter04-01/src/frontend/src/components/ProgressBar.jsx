/**
 * 进度条组件。
 * 显示处理进度：已处理/总数、百分比、进度条动画。
 */

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
    <div className="p-6 bg-white border border-border rounded-lg mt-6 shadow-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <span className="text-body-lg text-ink flex items-center gap-2">
          {showPulse && (
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-brand"></span>
            </span>
          )}
          正在整理
        </span>
        <span className="text-body-md text-text-secondary font-medium">{processed} / {total} 张</span>
      </div>
      <div className="h-3 bg-surface-badge rounded-full overflow-hidden ring-1 ring-black/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            showPulse
              ? 'bg-gradient-to-r from-brand to-brand-dark animate-pulse-opacity'
              : 'bg-gradient-to-r from-brand to-brand-dark'
          }`}
          style={{
            width: `${Math.max(progress, 3)}%`,
            backgroundImage: showPulse ? 'linear-gradient(90deg, #2DD4A8, #20B2AA, #2DD4A8)' : undefined,
            backgroundSize: showPulse ? '20px 100%' : undefined,
          }}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-body-sm text-text-secondary">{statusText}</span>
        <span className="text-body-sm font-semibold text-brand">{progress}%</span>
      </div>
    </div>
  );
}

export default ProgressBar;
