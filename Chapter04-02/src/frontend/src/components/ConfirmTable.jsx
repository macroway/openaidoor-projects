/**
 * 人工确认表组件。
 * - 渲染确认问题表格（客户名称、问题所在、追问建议）
 * - 追问建议列可编辑
 * - 支持行删除
 */
import { color, font, spacing, radius, transition } from '../styles/tokens';

const styles = {
  wrapper: {
    background: color.bgCard,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  scroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: font.size.base,
  },
  th: {
    background: color.bgHeader,
    padding: `${spacing.xs}px ${spacing.md}px`,
    textAlign: 'left',
    fontWeight: font.weight.medium,
    color: color.textSecondary,
    fontSize: font.size.sm,
    borderBottom: `1px solid ${color.border}`,
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
  },
  td: {
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderBottom: `1px solid ${color.borderLight}`,
    color: color.textSecondary,
    verticalAlign: 'middle',
  },
  cellCustomer: {
    fontWeight: font.weight.medium,
    color: color.textPrimary,
    whiteSpace: 'nowrap',
  },
  cellIssue: {
    color: color.danger,
    fontWeight: font.weight.medium,
    fontSize: font.size.sm,
  },
  cellSuggest: {
    color: color.success,
    fontSize: font.size.sm,
  },
  rowActions: {
    display: 'flex',
    gap: spacing.xxs,
  },
  actionBtn: {
    width: 24,
    height: 24,
    border: 'none',
    background: 'transparent',
    color: color.textDisabled,
    cursor: 'pointer',
    borderRadius: radius.xs,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${transition.fast}`,
  },
  empty: {
    textAlign: 'center',
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    color: color.textTertiary,
    fontSize: font.size.base,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
    color: color.success,
  },
};

function ConfirmTable({ items, onItemsChange }) {
  const handleDelete = (index) => {
    const updated = items.filter((_, i) => i !== index);
    onItemsChange?.(updated);
  };

  const handleSuggestionEdit = (index, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], suggestion: value };
    onItemsChange?.(updated);
  };

  if (!items || items.length === 0) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.empty}>
          <div style={styles.emptyIcon}>✓</div>
          <p>没有需要确认的问题，所有信息已完整</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.scroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: 40 }}></th>
              <th style={styles.th}>客户名称</th>
              <th style={styles.th}>问题所在</th>
              <th style={styles.th}>应该向客户追问什么</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index}>
                <td style={styles.td}>
                  <div style={styles.rowActions}>
                    <button
                      style={styles.actionBtn}
                      title="删除"
                      onClick={() => handleDelete(index)}
                      onMouseEnter={e => { e.currentTarget.style.background = color.dangerLight; e.currentTarget.style.color = color.danger; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color.textDisabled; }}
                    >
                      ×
                    </button>
                  </div>
                </td>
                <td style={{ ...styles.td, ...styles.cellCustomer }}>
                  {item.customer_name}
                </td>
                <td style={{ ...styles.td, ...styles.cellIssue }}>
                  {item.issue}
                </td>
                <td
                  style={{ ...styles.td, ...styles.cellSuggest, cursor: 'text' }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const newVal = e.currentTarget.textContent.trim();
                    if (newVal !== (item.suggestion || '')) {
                      handleSuggestionEdit(index, newVal);
                    }
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = color.bgActive; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                >
                  {item.suggestion}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ConfirmTable;
