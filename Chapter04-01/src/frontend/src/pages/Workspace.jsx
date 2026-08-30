import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadZone from '../components/UploadZone';
import FileList from '../components/FileList';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { uploadFiles, deleteFile, startProcess, getTaskStatus } from '../api/client';

const POLL_INTERVAL = 1000; // 轮询间隔 1 秒

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
    <div className="max-w-workspace mx-auto px-6 pt-10 pb-20 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-lg text-ink mb-2">新建整理任务</h1>
        <p className="text-body-lg text-text-secondary font-normal">上传微信聊天截图，自动提取询价信息并整理成 Excel</p>
        <div className="mt-3 h-1 w-12 bg-gradient-to-r from-brand to-brand-dark rounded-full"></div>
      </div>

      {!processing && <UploadZone onUpload={handleUpload} />}

      {error && (
        <div className="text-danger text-body-md mt-2 py-3 px-4 bg-danger-light rounded-lg border border-danger/20 flex items-center gap-2">
          <span className="text-lg">⚠</span>
          {error}
        </div>
      )}

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

      {/* Action Bar */}
      <div className="flex justify-between items-center py-5 px-6 bg-white border border-border rounded-lg mt-6 shadow-card">
        <div className="text-body-md text-text-secondary">
          共 <strong className="text-ink text-body-lg">{files.length}</strong> 张截图
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClear} disabled={files.length === 0 || processing}>
            清空列表
          </Button>
          <Button variant="primary" disabled={isButtonDisabled} onClick={handleStart}>
            开始整理 →
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Workspace;
