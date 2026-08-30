/**
 * 空状态组件。
 * - icon: 可选图标字符
 * - message: 提示文字
 */

function EmptyState({ icon, message }) {
  return (
    <div className="empty-state">
      {icon && <div className="text-4xl mb-3">{icon}</div>}
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;
