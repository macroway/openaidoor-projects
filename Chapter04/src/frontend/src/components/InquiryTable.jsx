/**
 * 询价整理表组件。
 * - 渲染数据表格（9 列）
 * - 支持 contenteditable 单元格编辑
 * - 支持行删除
 * - 编辑计数回调
 */
import { useRef, useCallback } from 'react';

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
  cellProduct: {
    fontWeight: 600,
    color: '#1A1A2E',
  },
  cellQuantity: {
    fontWeight: 700,
    color: '#059669',
    fontSize: 15,
  },
  cellMissing: {
    color: '#D97706',
    fontSize: 13,
  },
  cellOriginal: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    maxWidth: 200,
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
    padding: '40px 24px',
    color: '#9CA3AF',
    fontSize: 14,
  },
};

const URGENT_STYLES = {
  '普通': { background: '#F3F4F6', color: '#6B7280' },
  '较急': { background: '#FEF3C7', color: '#D97706' },
  '紧急': { background: '#FEE2E2', color: '#DC2626' },
};

function UrgencyBadge({ value }) {
  const s = URGENT_STYLES[value] || URGENT_STYLES['普通'];
  return (
    <span style={{
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 6,
      fontSize: 12,
      fontWeight: 600,
      ...s,
    }}>
      {value}
    </span>
  );
}

function InquiryTable({ records, onRecordsChange, onEditCount }) {
  const editCountRef = useRef(0);

  const handleCellEdit = useCallback((index, field, value) => {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    onRecordsChange(updated);
    editCountRef.current += 1;
    onEditCount?.(editCountRef.current);
  }, [records, onRecordsChange, onEditCount]);

  const handleDelete = useCallback((index) => {
    const updated = records.filter((_, i) => i !== index);
    onRecordsChange(updated);
  }, [records, onRecordsChange]);

  const columns = [
    { key: '_action', label: '', width: 40, editable: false },
    { key: 'customer_name', label: '客户名称', editable: true, cellStyle: styles.cellCustomer },
    { key: 'product', label: '商品', editable: true, cellStyle: styles.cellProduct },
    { key: 'spec', label: '规格', editable: true },
    { key: 'quantity', label: '数量', editable: true, cellStyle: styles.cellQuantity },
    { key: 'target_price', label: '期望价格', editable: true },
    { key: 'delivery', label: '交期和到货地', editable: true },
    { key: 'urgency', label: '紧急度', editable: false },
    { key: 'missing_info', label: '缺失信息', editable: true, cellStyle: styles.cellMissing },
    { key: 'source_text', label: '原文依据', editable: true, cellStyle: styles.cellOriginal },
  ];

  if (!records || records.length === 0) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.empty}>暂无询价记录</div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.scroll}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={{ ...styles.th, ...(col.width ? { width: col.width } : {}) }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, rowIndex) => (
              <tr key={record.id || rowIndex}>
                {/* 操作列 */}
                <td style={styles.td}>
                  <div style={styles.rowActions}>
                    <button
                      style={styles.actionBtn}
                      title="删除"
                      onClick={() => handleDelete(rowIndex)}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#EF4444'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#D1D5DB'; }}
                    >
                      ×
                    </button>
                  </div>
                </td>

                {/* 数据列 */}
                {columns.slice(1).map(col => {
                  const value = record[col.key] || '';

                  // 紧急度列用 Badge 渲染
                  if (col.key === 'urgency') {
                    return (
                      <td key={col.key} style={styles.td}>
                        <UrgencyBadge value={value} />
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      style={{
                        ...styles.td,
                        ...(col.cellStyle || {}),
                        cursor: 'text',
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const newVal = e.currentTarget.textContent.trim();
                        if (newVal !== (value || '')) {
                          handleCellEdit(rowIndex, col.key, newVal);
                        }
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F0FDF9'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = ''; }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InquiryTable;
