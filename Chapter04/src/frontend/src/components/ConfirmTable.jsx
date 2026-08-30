/**
 * 人工确认表组件。
 * - 渲染确认问题表格（客户名称、问题所在、追问建议）
 * - 追问建议列可编辑
 * - 支持行删除
 */

const styles = {
  wrapper: {
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  scroll: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    background: '#F9FAFB',
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: 700,
    color: '#374151',
    fontSize: 13,
    borderBottom: '2px solid #E5E7EB',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #F3F4F6',
    color: '#4B5563',
    verticalAlign: 'top',
  },
  cellCustomer: {
    fontWeight: 600,
    color: '#1A1A2E',
    whiteSpace: 'nowrap',
  },
  cellIssue: {
    color: '#DC2626',
    fontWeight: 600,
    fontSize: 13,
  },
  cellSuggest: {
    color: '#059669',
    fontSize: 13,
  },
  rowActions: {
    display: 'flex',
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    border: 'none',
    background: 'transparent',
    color: '#D1D5DB',
    cursor: 'pointer',
    borderRadius: 6,
    fontSize: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 24px',
    color: '#9CA3AF',
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
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
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D1D5DB'; }}
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
                  onMouseEnter={e => { e.currentTarget.style.background = '#F0FDF9'; }}
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
