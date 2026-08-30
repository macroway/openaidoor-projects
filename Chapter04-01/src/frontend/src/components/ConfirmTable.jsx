/**
 * 人工确认表组件。
 * - 渲染确认问题表格（客户名称、问题所在、追问建议）
 * - 追问建议列可编辑
 * - 支持行删除
 */
import IconButton from './IconButton';
import EmptyState from './EmptyState';

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
      <div className="card">
        <EmptyState icon="✓" message="没有需要确认的问题，所有信息已完整" />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th className="table-th w-10"></th>
              <th className="table-th">客户名称</th>
              <th className="table-th">问题所在</th>
              <th className="table-th">应该向客户追问什么</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id || index} className="table-row group/row">
                <td className="table-td">
                  <div className="flex gap-1 opacity-50 group-hover/row:opacity-100 transition-opacity">
                    <IconButton onClick={() => handleDelete(index)} title="删除">×</IconButton>
                  </div>
                </td>
                <td className="table-td font-semibold text-ink whitespace-nowrap">
                  {item.customer_name}
                </td>
                <td className="table-td text-danger-strong font-semibold text-body-sm">
                  {item.issue}
                </td>
                <td
                  className="table-td editable-cell text-success text-body-sm cursor-text"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => {
                    const newVal = e.currentTarget.textContent.trim();
                    if (newVal !== (item.suggestion || '')) {
                      handleSuggestionEdit(index, newVal);
                    }
                  }}
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
