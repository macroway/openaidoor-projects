/**
 * 询价整理表组件。
 * - 渲染数据表格（9 列）
 * - 支持 contenteditable 单元格编辑
 * - 支持行删除
 * - 编辑计数回调
 */
import { useRef, useCallback } from 'react';
import IconButton from './IconButton';
import Badge from './Badge';

function UrgencyBadge({ value }) {
  const variantMap = {
    '普通': 'default',
    '较急': 'warning',
    '紧急': 'danger',
  };
  return <Badge variant={variantMap[value] || 'default'}>{value}</Badge>;
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
    { key: '_action', label: '', width: 'w-10', editable: false },
    { key: 'customer_name', label: '客户名称', editable: true, cellClass: 'font-semibold text-ink whitespace-nowrap' },
    { key: 'product', label: '商品', editable: true, cellClass: 'font-semibold text-ink' },
    { key: 'spec', label: '规格', editable: true },
    { key: 'quantity', label: '数量', editable: true, cellClass: 'font-bold text-success text-[15px]' },
    { key: 'target_price', label: '期望价格', editable: true },
    { key: 'delivery', label: '交期和到货地', editable: true },
    { key: 'urgency', label: '紧急度', editable: false },
    { key: 'missing_info', label: '缺失信息', editable: true, cellClass: 'text-warning text-body-sm' },
    { key: 'source_text', label: '原文依据', editable: true, cellClass: 'text-caption text-text-muted italic max-w-[200px]' },
  ];

  if (!records || records.length === 0) {
    return (
      <div className="card">
        <div className="empty-state py-10 px-6">暂无询价记录</div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={`table-th ${col.width || ''}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((record, rowIndex) => (
              <tr key={record.id || rowIndex} className="table-row group/row">
                {/* 操作列 */}
                <td className="table-td">
                  <div className="flex gap-1 opacity-50 group-hover/row:opacity-100 transition-opacity">
                    <IconButton onClick={() => handleDelete(rowIndex)} title="删除">×</IconButton>
                  </div>
                </td>

                {/* 数据列 */}
                {columns.slice(1).map(col => {
                  const value = record[col.key] || '';

                  // 紧急度列用 Badge 渲染
                  if (col.key === 'urgency') {
                    return (
                      <td key={col.key} className="table-td">
                        <UrgencyBadge value={value} />
                      </td>
                    );
                  }

                  return (
                    <td
                      key={col.key}
                      className={`table-td editable-cell ${col.cellClass || ''}`}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => {
                        const newVal = e.currentTarget.textContent.trim();
                        if (newVal !== (value || '')) {
                          handleCellEdit(rowIndex, col.key, newVal);
                        }
                      }}
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
