import { color, font, spacing, radius, transition } from '../styles/tokens';

const styles = {
  section: {
    marginBottom: spacing.xxl,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: font.size.lg,
    fontWeight: font.weight.semibold,
    color: color.textPrimary,
  },
  count: {
    fontSize: font.size.xs,
    color: color.textSecondary,
    background: color.bgHover,
    padding: `${spacing.xxs}px ${spacing.sm}px`,
    borderRadius: radius.full,
    fontWeight: font.weight.medium,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    background: color.bgCard,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    padding: `${spacing.sm}px ${spacing.md}px`,
    transition: `background ${transition.fast}`,
  },
  thumb: {
    width: 40,
    height: 40,
    background: color.bgHover,
    borderRadius: radius.sm,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    flexShrink: 0,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: font.size.base,
    fontWeight: font.weight.medium,
    color: color.textPrimary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    fontSize: font.size.xs,
    color: color.textTertiary,
    marginTop: 2,
  },
  status: {
    fontSize: font.size.xs,
    fontWeight: font.weight.medium,
    padding: `${spacing.xxs}px ${spacing.xs}px`,
    borderRadius: radius.full,
    flexShrink: 0,
    background: color.warningLight,
    color: color.warning,
  },
  removeBtn: {
    width: 28,
    height: 28,
    border: 'none',
    background: 'transparent',
    color: color.textDisabled,
    cursor: 'pointer',
    borderRadius: radius.sm,
    fontSize: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: `all ${transition.fast}`,
  },
  empty: {
    textAlign: 'center',
    padding: `${spacing.xl}px 0`,
    color: color.textTertiary,
    fontSize: font.size.base,
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
                e.currentTarget.style.background = color.dangerLight;
                e.currentTarget.style.color = color.danger;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = color.textDisabled;
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
