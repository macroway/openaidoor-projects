import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import { uploadFiles, deleteFile, startProcess, getTaskStatus } from '../api/client';
import { color, font, spacing, radius, transition } from '../styles/tokens';

const POLL_INTERVAL = 1000; // 轮询间隔 1 秒

const styles = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: `${spacing.xxl}px ${spacing.xl}px ${spacing.xxxl}px`,
  },
  header: {
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: color.textPrimary,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    fontSize: font.size.base,
    color: color.textTertiary,
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `${spacing.md}px ${spacing.xl}px`,
    background: color.bgCard,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    marginTop: spacing.xl,
  },
  actionInfo: {
    fontSize: font.size.base,
    color: color.textSecondary,
  },
  actionButtons: {
    display: 'flex',
    gap: spacing.sm,
  },
  btnPrimary: {
    fontSize: font.size.base,
    fontWeight: font.weight.medium,
    padding: `${spacing.xs}px ${spacing.lg}px`,
    borderRadius: radius.sm,
    border: 'none',
    cursor: 'pointer',
    background: color.brand,
    color: color.textInverse,
    transition: `background ${transition.fast}`,
  },
  btnPrimaryHover: {
    background: color.brandHover,
  },
  btnPrimaryDisabled: {
    background: color.textDisabled,
    cursor: 'not-allowed',
  },
  btnOutline: {
    fontSize: font.size.base,
    fontWeight: font.weight.medium,
    padding: `${spacing.xs}px ${spacing.lg}px`,
    borderRadius: radius.sm,
    border: `1px solid ${color.border}`,
    cursor: 'pointer',
    background: color.bgCard,
    color: color.textSecondary,
    transition: `all ${transition.fast}`,
  },
  error: {
    color: color.danger,
    fontSize: font.size.base,
    marginTop: spacing.xs,
    padding: `${spacing.sm}px ${spacing.md}px`,
    background: color.dangerLight,
    borderRadius: radius.sm,
    border: `1px solid ${color.danger}22`,
  },
};

function Workspace() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [taskProgress, setTaskProgress] = useState(null);
  const pollRef = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleUpload = async (newFiles) => {
    setUploading(true);
    setError(null);
    try {
      const response = await uploadFiles(newFiles);
      setFiles(prev => [...prev, ...response.files]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (fileId) => {
    try {
      await deleteFile(fileId);
      setFiles(prev => prev.filter(f => f.file_id !== fileId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = () => {
    setFiles([]);
  };

  const handleStart = async () => {
    if (files.length === 0 || processing) return;
    setError(null);
    setProcessing(true);

    try {
      const fileIds = files.map(f => f.file_id);
      const { task_id } = await startProcess(fileIds);

      setTaskProgress({ processed: 0, total: files.length, status: 'processing' });

      pollRef.current = setInterval(async () => {
        try {
          const status = await getTaskStatus(task_id);
          setTaskProgress({
            processed: status.processed_images,
            total: status.total_images,
            status: status.status,
          });

          if (status.status === 'completed') {
            stopPolling();
            setProcessing(false);
            navigate('/results', { state: { taskId: task_id } });
          } else if (status.status === 'failed') {
            stopPolling();
            setProcessing(false);
            setError('处理失败，请重试');
          }
        } catch (err) {
          stopPolling();
          setProcessing(false);
          setError('查询进度失败: ' + err.message);
        }
      }, POLL_INTERVAL);
    } catch (err) {
      setProcessing(false);
      setError(err.message);
    }
  };

  const isButtonDisabled = files.length === 0 || processing;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>新建整理任务</h1>
        <p style={styles.subtitle}>上传微信聊天截图，自动提取询价信息并整理成 Excel</p>
      </div>

      {!processing && <UploadZone onUpload={handleUpload} />}

      {error && <div style={styles.error}>{error}</div>}

      {!processing && (
        <FileList files={files} onRemove={handleRemove} />
      )}

      {processing && taskProgress && (
        <ProgressBar
          processed={taskProgress.processed}
          total={taskProgress.total}
          status={taskProgress.status}
        />
      )}

      <div style={styles.actionBar}>
        <div style={styles.actionInfo}>
          共 <strong>{files.length}</strong> 张截图
        </div>
        <div style={styles.actionButtons}>
          <button
            style={styles.btnOutline}
            onClick={handleClear}
            disabled={files.length === 0 || processing}
          >
            清空列表
          </button>
          <button
            style={{
              ...styles.btnPrimary,
              ...(isButtonDisabled ? styles.btnPrimaryDisabled : {}),
            }}
            disabled={isButtonDisabled}
            onClick={handleStart}
            onMouseEnter={e => { if (!isButtonDisabled) e.currentTarget.style.background = color.brandHover; }}
            onMouseLeave={e => { if (!isButtonDisabled) e.currentTarget.style.background = color.brand; }}
          >
            开始整理 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
