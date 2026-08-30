/**
 * 结果页面。
 * - 双 Tab 切换：询价整理表 / 人工确认问题
 * - 表格渲染、单元格编辑、行删除
 * - 统计栏和底部工具栏（导出按钮）
 * - 从 location.state.taskId 获取任务 ID，加载结果数据
 */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import InquiryTable from '../components/InquiryTable';
import ConfirmTable from '../components/ConfirmTable';
import Button from '../components/Button';
import Badge from '../components/Badge';
import { getTaskResult, exportExcel } from '../api/client';

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const taskId = location.state?.taskId;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [records, setRecords] = useState([]);
  const [confirmItems, setConfirmItems] = useState([]);
  const [activeTab, setActiveTab] = useState('inquiry');
  const [editCount, setEditCount] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setLoading(false);
      setError('没有任务信息，请从工作台开始');
      return;
    }

    const fetchResult = async () => {
      try {
        const data = await getTaskResult(taskId);
        setRecords(data.records || []);
        setConfirmItems(data.confirm_items || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResult();
  }, [taskId]);

  const handleExport = async () => {
    if (records.length === 0 || exporting) return;
    setExporting(true);
    try {
      await exportExcel(records, confirmItems);
    } catch (err) {
      alert('导出失败: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  const uniqueCustomers = new Set(records.map(r => r.customer_name)).size;

  if (loading) {
    return (
      <div className="max-w-results mx-auto px-6 pt-8 pb-24">
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-body-lg text-text-secondary">加载结果中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-results mx-auto px-6 pt-8 pb-24">
        <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
          <div className="w-16 h-16 bg-danger-light rounded-full flex items-center justify-center text-3xl mb-4">⚠</div>
          <p className="text-body-lg text-danger mb-6">{error}</p>
          <Link to="/"><Button variant="outline">返回工作台</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-results mx-auto px-6 pt-8 pb-24 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-start mb-7">
        <div>
          <h1 className="text-heading-lg text-ink mb-2">整理结果</h1>
          <div className="text-body-md text-text-secondary">
            识别到 <span className="text-brand font-bold">{uniqueCustomers} 个客户</span> · <span className="text-brand font-bold">{records.length} 条询价记录</span>
          </div>
          <div className="mt-3 h-1 w-12 bg-gradient-to-r from-brand to-brand-dark rounded-full"></div>
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => navigate('/')}>重新上传</Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-3 py-4 px-5 bg-white border border-border rounded-lg shadow-card">
          <div className="w-10 h-10 rounded-lg bg-brand-light flex items-center justify-center">
            <span className="text-brand text-xl font-bold">📋</span>
          </div>
          <div>
            <div className="text-body-lg font-bold text-ink">{records.length}</div>
            <div className="text-caption text-text-muted">条记录</div>
          </div>
        </div>
        <div className="flex items-center gap-3 py-4 px-5 bg-white border border-border rounded-lg shadow-card">
          <div className="w-10 h-10 rounded-lg bg-warning-light flex items-center justify-center">
            <span className="text-warning text-xl font-bold">?</span>
          </div>
          <div>
            <div className="text-body-lg font-bold text-ink">{confirmItems.length}</div>
            <div className="text-caption text-text-muted">项待确认</div>
          </div>
        </div>
        <div className="flex items-center gap-3 py-4 px-5 bg-white border border-border rounded-lg shadow-card">
          <div className="w-10 h-10 rounded-lg bg-danger-light flex items-center justify-center">
            <span className="text-danger text-xl font-bold">!</span>
          </div>
          <div>
            <div className="text-body-lg font-bold text-ink">0</div>
            <div className="text-caption text-text-muted">项异常</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-0 bg-white border border-border rounded-t-lg px-2 pt-2 shadow-card">
        <button
          className={`py-2.5 px-5 text-body-md font-semibold rounded-t-md flex items-center gap-2 transition-all duration-200 border-none ${
            activeTab === 'inquiry'
              ? 'text-ink bg-surface-card border-b-2 border-brand'
              : 'text-text-secondary bg-transparent hover:text-ink hover:bg-surface-card/50'
          }`}
          onClick={() => setActiveTab('inquiry')}
        >
          询价整理表
          <Badge>{records.length}</Badge>
        </button>
        <button
          className={`py-2.5 px-5 text-body-md font-semibold rounded-t-md flex items-center gap-2 transition-all duration-200 border-none ${
            activeTab === 'confirm'
              ? 'text-ink bg-surface-card border-b-2 border-brand'
              : 'text-text-secondary bg-transparent hover:text-ink hover:bg-surface-card/50'
          }`}
          onClick={() => setActiveTab('confirm')}
        >
          需要人工确认的问题
          <Badge variant={confirmItems.length > 0 ? 'warning' : 'default'}>
            {confirmItems.length}
          </Badge>
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'inquiry' && (
          <InquiryTable
            records={records}
            onRecordsChange={setRecords}
            onEditCount={setEditCount}
          />
        )}
        {activeTab === 'confirm' && (
          <ConfirmTable
            items={confirmItems}
            onItemsChange={setConfirmItems}
          />
        )}
      </div>

      {/* Footer Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border py-3.5 px-12 flex justify-between items-center z-50 shadow-footer">
        <div className="text-body-sm text-text-secondary">
          已编辑 <strong className="text-ink">{editCount}</strong> 处
        </div>
        <div className="flex gap-2.5">
          <Button variant="outline" onClick={() => navigate('/')}>返回工作台</Button>
          <Button
            variant="primary"
            disabled={records.length === 0 || exporting}
            onClick={handleExport}
          >
            {exporting ? '导出中...' : '导出 Excel ↓'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Results;
