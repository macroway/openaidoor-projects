import { useState, useRef } from 'react';

const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_SIZE_MB = 10;

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
        className={`relative border-2 border-dashed rounded-2xl py-16 px-10 text-center cursor-pointer mb-6 transition-all duration-300 ${
          isDragging
            ? 'border-brand bg-brand-light scale-[1.01] shadow-card-hover'
            : 'border-disabled bg-white hover:border-brand hover:bg-brand-light/50 hover:shadow-card'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {/* 装饰性背景 */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
          <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full transition-opacity duration-300 ${isDragging ? 'opacity-20' : 'opacity-0 hover:opacity-10'}`} style={{ background: 'radial-gradient(circle, #2DD4A8, transparent)' }} />
          <div className={`absolute -bottom-10 -left-10 w-24 h-24 rounded-full transition-opacity duration-300 ${isDragging ? 'opacity-15' : 'opacity-0 hover:opacity-10'}`} style={{ background: 'radial-gradient(circle, #20B2AA, transparent)' }} />
        </div>

        <div className={`relative w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center text-4xl transition-all duration-300 ${
          isDragging
            ? 'bg-gradient-to-br from-brand to-brand-dark shadow-btn scale-110'
            : 'bg-brand-light hover:shadow-btn'
        }`}>
          <span className={isDragging ? 'grayscale-0 brightness-200' : ''}>📁</span>
        </div>
        <h3 className="relative text-heading-md text-ink mb-2">
          {isDragging ? '松开即可上传' : '拖拽截图到此处，或点击选择文件'}
        </h3>
        <p className="relative text-body-md text-text-muted mb-1">支持批量上传，系统会自动按客户名称分组</p>
        <div className="relative text-caption text-text-muted mt-4 flex items-center justify-center gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-badge rounded-md">PNG</span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface-badge rounded-md">JPG</span>
          <span className="text-text-muted">· 单个文件不超过 {MAX_SIZE_MB}MB</span>
        </div>
        {error && (
          <div className="relative text-body-sm text-danger mt-3 py-2 px-3 bg-danger-light rounded-lg inline-block">
            {error}
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}

export default UploadZone;
