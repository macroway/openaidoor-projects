import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import { uploadFiles, deleteFile, startProcess, getTaskStatus } from '../api/client';

const POLL_INTERVAL = 1000; // 轮询间隔 1 秒

const styles = {
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '40px 24px 80px',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: 800,
    color: '#1A1A2E',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  actionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    marginTop: 24,
  },
  actionInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  actionButtons: {
    display: 'flex',
    gap: 12,
  },
  btnPrimary: {
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    background: '#2DD4A8',
    color: '#fff',
  },
  btnPrimaryDisabled: {
    background: '#D1D5DB',
    cursor: 'not-allowed',
  },
  btnOutline: {
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 24px',
    borderRadius: 10,
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    background: 'transparent',
    color: '#6B7280',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 8,
    padding: '12px 16px',
    background: '#FEE2E2',
    borderRadius: 8,
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
          >
            开始整理 →
          </button>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
