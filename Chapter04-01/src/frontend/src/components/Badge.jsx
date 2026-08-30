/**
 * 通用 Badge 组件。
 * - variant: 'default' | 'warning' | 'danger' | 'success'
 * - children: 显示文字
 */

const variantClasses = {
  default: 'badge-default',
  warning: 'badge-warning',
  danger: 'badge-danger',
  success: 'badge-success',
};

function Badge({ variant = 'default', children, className = '' }) {
  const cls = variantClasses[variant] || variantClasses.default;
  return (
    <span className={`${cls} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
