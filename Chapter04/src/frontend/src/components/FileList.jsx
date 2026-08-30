const styles = {
  section: {
    marginBottom: 32,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1A1A2E',
  },
  count: {
    fontSize: 13,
    color: '#6B7280',
    background: '#F3F4F6',
    padding: '4px 12px',
    borderRadius: 12,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 10,
    padding: '14px 18px',
  },
  thumb: {
    width: 44,
    height: 44,
    background: '#F3F4F6',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 18,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1A1A2E',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 6,
    flexShrink: 0,
    background: '#F0FDF9',
    color: '#059669',
  },
  removeBtn: {
    width: 28,
    height: 28,
    border: 'none',
    background: 'transparent',
    color: '#D1D5DB',
    cursor: 'pointer',
    borderRadius: 6,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  empty: {
    textAlign: 'center',
    padding: '24px 0',
    color: '#9CA3AF',
    fontSize: 14,
  },
};

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
      <div style={styles.section}>
        <div style={styles.header}>
          <h3 style={styles.title}>已上传文件</h3>
        </div>
        <div style={styles.empty}>暂无文件，请上传截图</div>
      </div>
    );
  }

  return (
    <div style={styles.section}>
      <div style={styles.header}>
        <h3 style={styles.title}>已上传文件</h3>
        <span style={styles.count}>{files.length} 个文件</span>
      </div>
      <div style={styles.list}>
        {files.map(file => (
          <div key={file.file_id} style={styles.item}>
            <div style={styles.thumb}>🖼</div>
            <div style={styles.info}>
              <div style={styles.name}>{file.filename}</div>
              <div style={styles.meta}>{formatSize(file.size)}</div>
            </div>
            <span style={styles.status}>待处理</span>
            <button
              style={styles.removeBtn}
              onClick={() => onRemove(file.file_id)}
              title="删除"
              onMouseEnter={e => {
                e.currentTarget.style.background = '#FEE2E2';
                e.currentTarget.style.color = '#EF4444';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#D1D5DB';
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileList;
