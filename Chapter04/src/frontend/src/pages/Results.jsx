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
import { getTaskResult, exportExcel } from '../api/client';

const styles = {
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '32px 24px 100px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    color: '#6B7280',
  },
  metaHighlight: {
    color: '#2DD4A8',
    fontWeight: 700,
  },
  headerActions: {
    display: 'flex',
    gap: 10,
  },
  btnOutline: {
    fontSize: 14,
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    cursor: 'pointer',
    background: '#fff',
    color: '#6B7280',
  },
  statsBar: {
    display: 'flex',
    gap: 24,
    padding: '16px 20px',
    background: '#fff',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    marginBottom: 20,
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#6B7280',
  },
  statStrong: {
    color: '#1A1A2E',
    fontWeight: 700,
    fontSize: 18,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  tabs: {
    display: 'flex',
    borderBottom: '2px solid #E5E7EB',
    marginBottom: 0,
  },
  tab: {
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    color: '#6B7280',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -2,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'none',
    border: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
  },
  tabActive: {
    color: '#1A1A2E',
    borderBottomColor: '#2DD4A8',
  },
  badge: {
    background: '#F3F4F6',
    color: '#6B7280',
    fontSize: 12,
    padding: '2px 8px',
    borderRadius: 10,
    fontWeight: 600,
  },
  badgeWarning: {
    background: '#FEF3C7',
    color: '#D97706',
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: '#fff',
    borderTop: '1px solid #E5E7EB',
    padding: '14px 48px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  footerInfo: {
    fontSize: 13,
    color: '#6B7280',
  },
  footerActions: {
    display: 'flex',
    gap: 10,
  },
  btnPrimary: {
    fontSize: 14,
    fontWeight: 600,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    background: '#2DD4A8',
    color: '#fff',
  },
  btnPrimaryDisabled: {
    background: '#D1D5DB',
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#9CA3AF',
    fontSize: 16,
  },
  error: {
    textAlign: 'center',
    padding: '60px 24px',
    color: '#EF4444',
    fontSize: 14,
  },
};

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
      <div style={styles.main}>
        <div style={styles.loading}>加载结果中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.main}>
        <div style={styles.error}>{error}</div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={styles.btnOutline}>返回工作台</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>整理结果</h1>
          <div style={styles.meta}>
            识别到 <span style={styles.metaHighlight}>{uniqueCustomers} 个客户</span> · <span style={styles.metaHighlight}>{records.length} 条询价记录</span>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.btnOutline} onClick={() => navigate('/')}>
            重新上传
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={styles.statsBar}>
        <div style={styles.stat}>
          <div style={{ ...styles.statDot, background: '#2DD4A8' }} />
          <span style={styles.statStrong}>{records.length}</span> 条记录
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statDot, background: '#FBBF24' }} />
          <span style={styles.statStrong}>{confirmItems.length}</span> 项待确认
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statDot, background: '#EF4444' }} />
          <span style={styles.statStrong}>0</span> 项异常
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'inquiry' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('inquiry')}
        >
          询价整理表
          <span style={styles.badge}>{records.length}</span>
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'confirm' ? styles.tabActive : {}) }}
          onClick={() => setActiveTab('confirm')}
        >
          需要人工确认的问题
          <span style={{
            ...styles.badge,
            ...(confirmItems.length > 0 ? styles.badgeWarning : {}),
          }}>
            {confirmItems.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: 0 }}>
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
      <div style={styles.footer}>
        <div style={styles.footerInfo}>
          已编辑 <strong>{editCount}</strong> 处
        </div>
        <div style={styles.footerActions}>
          <button style={styles.btnOutline} onClick={() => navigate('/')}>
            返回工作台
          </button>
          <button
            style={{
              ...styles.btnPrimary,
              ...(records.length === 0 || exporting ? styles.btnPrimaryDisabled : {}),
            }}
            disabled={records.length === 0 || exporting}
            onClick={handleExport}
          >
            {exporting ? '导出中...' : '导出 Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
