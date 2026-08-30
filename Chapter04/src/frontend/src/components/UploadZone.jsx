import { useState, useRef } from 'react';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 10;

const styles = {
  zone: {
    border: '2px dashed #D1D5DB',
    borderRadius: 16,
    padding: '56px 40px',
    textAlign: 'center',
    background: '#fff',
    cursor: 'pointer',
    marginBottom: 24,
    transition: 'border-color 0.2s, background 0.2s',
  },
  zoneHover: {
    borderColor: '#2DD4A8',
    background: '#ECFDF5',
  },
  icon: {
    width: 64,
    height: 64,
    background: '#F0FDF9',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  formats: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 12,
  },
  error: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 8,
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
