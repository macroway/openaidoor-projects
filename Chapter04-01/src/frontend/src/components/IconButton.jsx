/**
 * 图标按钮组件（删除等小操作）。
 * - onClick: 点击回调
 * - title: 无障碍标题
 * - children: 图标字符（如 ×）
 */

function IconButton({ onClick, title, children, className = '' }) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      onClick={onClick}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

export default IconButton;
