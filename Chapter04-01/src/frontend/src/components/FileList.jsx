import IconButton from './IconButton';

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

/**
 * 文件列表组件。
 * @param {Object} props
 * @param {Array<{file_id: string, filename: string, size: number}>} props.files
 * @param {Function} props.onRemove - 删除回调，参数为 file_id
 */
function FileList({ files, onRemove }) {
  if (!files || files.length === 0) {
    return (
      <div className="mb-8 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-heading-sm text-ink flex items-center gap-2">
            <span className="w-1 h-4 bg-brand rounded-full inline-block"></span>
            已上传文件
          </h3>
        </div>
        <div className="empty-state py-6">暂无文件，请上传截图</div>
      </div>
    );
  }

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-heading-sm text-ink flex items-center gap-2">
          <span className="w-1 h-4 bg-brand rounded-full inline-block"></span>
          已上传文件
        </h3>
        <span className="text-body-sm text-text-secondary bg-surface-badge px-3 py-1 rounded-full font-medium">{files.length} 个文件</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {files.map((file, idx) => (
          <div
            key={file.file_id}
            className="group flex items-center gap-4 bg-white border border-border rounded-lg px-4 py-3.5 shadow-card hover:shadow-card-hover hover:border-brand/30 transition-all duration-200"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="w-11 h-11 bg-gradient-to-br from-brand-light to-surface-badge rounded-lg flex items-center justify-center text-lg shrink-0 ring-1 ring-brand/10">
              🖼
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-body-md font-semibold text-ink truncate">{file.filename}</div>
              <div className="text-caption text-text-muted mt-0.5">{formatSize(file.size)}</div>
            </div>
            <span className="badge-success text-caption">待处理</span>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <IconButton onClick={() => onRemove(file.file_id)} title="删除">×</IconButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileList;
