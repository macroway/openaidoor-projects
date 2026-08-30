/**
 * 通用按钮组件。
 * - variant: 'primary' | 'outline'
 * - disabled: 禁用态
 * - children: 按钮文字
 * - onClick: 点击回调
 */

const variantClasses = {
  primary: 'btn-primary',
  outline: 'btn-outline',
};

function Button({ variant = 'primary', disabled = false, onClick, children, className = '', type = 'button', ...rest }) {
  const base = variantClasses[variant] || variantClasses.primary;
  const disabledClass = disabled && variant === 'primary' ? 'bg-disabled cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={`${base} ${disabledClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
