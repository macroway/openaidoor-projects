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
import { color, font, spacing, radius, transition } from '../styles/tokens';

const styles = {
  main: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: `${spacing.xxl}px ${spacing.xl}px 100px`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: font.size.xl,
    fontWeight: font.weight.bold,
    color: color.textPrimary,
    marginBottom: spacing.xxs,
  },
  meta: {
    fontSize: font.size.base,
    color: color.textTertiary,
  },
  metaHighlight: {
    color: color.brand,
    fontWeight: font.weight.semibold,
  },
  headerActions: {
    display: 'flex',
    gap: spacing.xs,
  },
  btnOutline: {
    fontSize: font.size.base,
    fontWeight: font.weight.medium,
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radius.sm,
    border: `1px solid ${color.border}`,
    cursor: 'pointer',
    background: color.bgCard,
    color: color.textSecondary,
    transition: `all ${transition.fast}`,
  },
  statsBar: {
    display: 'flex',
    gap: spacing.xxl,
    padding: `${spacing.md}px ${spacing.xl}px`,
    background: color.bgCard,
    border: `1px solid ${color.border}`,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  stat: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: font.size.sm,
    color: color.textSecondary,
  },
  statStrong: {
    color: color.textPrimary,
    fontWeight: font.weight.semibold,
    fontSize: font.size.lg,
  },
  statDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  tabs: {
    display: 'flex',
    borderBottom: `1px solid ${color.border}`,
    marginBottom: 0,
    gap: 0,
  },
  tab: {
    padding: `${spacing.sm}px ${spacing.xl}px`,
    fontSize: font.size.base,
    fontWeight: font.weight.medium,
    color: color.textTertiary,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: -1,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    background: 'none',
    border: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    transition: `all ${transition.fast}`,
  },
  tabActive: {
    color: color.textPrimary,
    borderBottomColor: color.brand,
    fontWeight: font.weight.semibold,
  },
  badge: {
    background: color.bgHover,
    color: color.textSecondary,
    fontSize: font.size.xs,
    padding: `1px ${spacing.xs}px`,
    borderRadius: radius.full,
    fontWeight: font.weight.medium,
  },
  badgeWarning: {
    background: color.warningLight,
    color: color.warning,
  },
  footer: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: color.bgCard,
    borderTop: `1px solid ${color.border}`,
    padding: `${spacing.sm}px ${spacing.xxl}px`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  footerInfo: {
    fontSize: font.size.sm,
    color: color.textSecondary,
  },
  footerActions: {
    display: 'flex',
    gap: spacing.xs,
  },
  btnPrimary: {
    fontSize: font.size.base,
    fontWeight: font.weight.medium,
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: radius.sm,
    border: 'none',
    cursor: 'pointer',
    background: color.brand,
    color: color.textInverse,
    transition: `background ${transition.fast}`,
  },
  btnPrimaryDisabled: {
    background: color.textDisabled,
    cursor: 'not-allowed',
  },
  loading: {
    textAlign: 'center',
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    color: color.textTertiary,
    fontSize: font.size.base,
  },
  error: {
    textAlign: 'center',
    padding: `${spacing.xxxl}px ${spacing.xl}px`,
    color: color.danger,
    fontSize: font.size.base,
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
          <div style={{ ...styles.statDot, background: color.brand }} />
          <span style={styles.statStrong}>{records.length}</span> 条记录
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statDot, background: color.warning }} />
          <span style={styles.statStrong}>{confirmItems.length}</span> 项待确认
        </div>
        <div style={styles.stat}>
          <div style={{ ...styles.statDot, background: color.danger }} />
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
            onMouseEnter={e => { if (records.length > 0 && !exporting) e.currentTarget.style.background = color.brandHover; }}
            onMouseLeave={e => { if (records.length > 0 && !exporting) e.currentTarget.style.background = color.brand; }}
          >
            {exporting ? '导出中...' : '导出 Excel'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Results;
