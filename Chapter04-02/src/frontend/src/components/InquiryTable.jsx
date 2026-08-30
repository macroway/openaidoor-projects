/**
 * 询价整理表组件。
 * - 渲染数据表格（9 列）
 * - 支持 contenteditable 单元格编辑
 * - 支持行删除
 * - 编辑计数回调
 */
import { useRef, useCallback } from 'react';
import { color, font, spacing, radius, transition, urgencyColors } from '../styles/tokens';

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
  cellProduct: {
    fontWeight: font.weight.medium,
    color: color.textPrimary,
  },
  cellQuantity: {
    fontWeight: font.weight.semibold,
    color: color.brand,
    fontSize: font.size.base,
  },
  cellMissing: {
    color: color.warning,
    fontSize: font.size.sm,
  },
  cellOriginal: {
    fontSize: font.size.xs,
    color: color.textTertiary,
    fontStyle: 'italic',
    maxWidth: 200,
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
    padding: `${spacing.xxl}px ${spacing.xl}px`,
    color: color.textTertiary,
    fontSize: font.size.base,
  },
};

function UrgencyBadge({ value }) {
  const s = urgencyColors[value] || urgencyColors['普通'];
  return (
    <span style={{
      display: 'inline-block',
      padding: `${spacing.xxs}px ${spacing.xs}px`,
      borderRadius: radius.full,
      fontSize: font.size.xs,
      fontWeight: font.weight.medium,
      background: s.bg,
      color: s.text,
      lineHeight: 1.6,
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
                      onMouseEnter={e => { e.currentTarget.style.background = color.dangerLight; e.currentTarget.style.color = color.danger; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color.textDisabled; }}
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
                      onMouseEnter={e => { e.currentTarget.style.background = color.bgActive; }}
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
