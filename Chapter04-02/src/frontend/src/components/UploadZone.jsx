import { useState, useRef } from 'react';
import { color, font, spacing, radius, transition } from '../styles/tokens';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 10;

const styles = {
  zone: {
    border: `2px dashed ${color.uploadBorder}`,
    borderRadius: radius.lg,
    padding: `${spacing.xxxl}px ${spacing.xxl}px`,
    textAlign: 'center',
    background: color.bgCard,
    cursor: 'pointer',
    marginBottom: spacing.xl,
    transition: `border-color ${transition.normal}, background ${transition.normal}`,
  },
  zoneHover: {
    borderColor: color.uploadHover,
    background: color.uploadBg,
  },
  icon: {
    width: 56,
    height: 56,
    background: color.uploadIconBg,
    borderRadius: radius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: `0 auto ${spacing.md}px`,
    fontSize: 24,
  },
  title: {
    fontSize: font.size.base,
    fontWeight: font.weight.semibold,
    color: color.textPrimary,
    marginBottom: spacing.xs,
  },
  desc: {
    fontSize: font.size.sm,
    color: color.textTertiary,
    marginBottom: spacing.xxs,
  },
  formats: {
    fontSize: font.size.xs,
    color: color.textDisabled,
    marginTop: spacing.sm,
  },
  error: {
    color: color.danger,
    fontSize: font.size.sm,
    marginTop: spacing.xs,
    padding: `${spacing.xs}px ${spacing.md}px`,
    background: color.dangerLight,
    borderRadius: radius.sm,
    display: 'inline-block',
  },
};

/**
 * 拖拽上传组件。
 * @param {Object} props
 * @param {Function} props.onUpload - 上传成功回调，参数为 File[]
 */
function UploadZone({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFiles = (files) => {
    const errors = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: 仅支持 PNG、JPG 格式`);
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name}: 文件过大（最大 ${MAX_SIZE_MB}MB）`);
      }
    }
    return errors;
  };

  const handleFiles = (files) => {
    setError(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const errors = validateFiles(fileArray);
    if (errors.length > 0) {
      setError(errors.join('；'));
      return;
    }

    onUpload(fileArray);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  return (
    <div>
      <div
        style={{ ...styles.zone, ...(isDragging ? styles.zoneHover : {}) }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div style={styles.icon}>📁</div>
        <h3 style={styles.title}>拖拽截图到此处，或点击选择文件</h3>
        <p style={styles.desc}>支持批量上传，系统会自动按客户名称分组</p>
        <div style={styles.formats}>支持 PNG、JPG 格式 · 单个文件不超过 {MAX_SIZE_MB}MB</div>
        {error && <div style={styles.error}>{error}</div>}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg"
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />
    </div>
  );
}

export default UploadZone;
