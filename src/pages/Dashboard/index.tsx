import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Progress, Drawer, InputNumber, Table, Tabs } from 'antd';
import { SettingOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined, EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, MarkLineComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import KpiCard from '../../components/KpiCard';
import HealthRadarChart from '../../components/charts/HealthRadarChart';
import AlertList from '../../components/InsightBox';
import {
  kpiData,
  alertData,
  radarData,
  diagnosisFactors,
  diagnosisConclusion,
  targetAchievementData,
  targetTrendData,
  monthCumulativeData,
} from '../../mock';
import type { FilterState } from '../../types';
import type { DiagnosisFactor, TargetAchievement } from '../../mock';
import { formatKpiValue, formatRate } from '../../utils/format';
import styles from './index.module.css';

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, LegendComponent, MarkLineComponent, CanvasRenderer]);

const STORAGE_KEY = 'growth-dashboard-targets';

// KPI cards: totalRevenue first, exclude removed ones
const reorderedKpiData = [
  kpiData.find(k => k.key === 'totalRevenue')!,
  ...kpiData.filter(k => k.key !== 'totalRevenue'),
];

function loadTargets(): Record<string, number> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveTargets(targets: Record<string, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(targets));
}

export default function Dashboard() {
  const { filter } = useOutletContext<{ filter: FilterState }>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className={styles.page}>
      {/* KPI cards */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiGrid}>
          {reorderedKpiData.map((kpi) => (
            <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
          ))}
        </div>
        <TargetCard onDrillDown={() => setDrawerOpen(true)} />
      </div>

      {/* Five-factor diagnosis */}
      <DiagnosisModule />

      {/* Alerts + radar */}
      <div className={styles.bottomRow}>
        <div className={styles.alertCard}>
          <AlertList alerts={alertData} />
        </div>
        <div className={styles.radarCard}>
          <HealthRadarChart data={radarData} />
        </div>
      </div>

      <TargetDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  );
}

/* ============================================================
   Target Card (compact)
   ============================================================ */
function TargetCard({ onDrillDown }: { onDrillDown: () => void }) {
  const [customTargets] = useState(() => loadTargets());
  const monthData = targetAchievementData.find(d => d.periodKey === 'thisMonth')!;
  const todayData = targetAchievementData.find(d => d.periodKey === 'today')!;

  const monthTarget = customTargets['thisMonth'] ?? monthData.target;
  const monthRate = monthData.actual / monthTarget;
  const todayTarget = customTargets['today'] ?? todayData.target;
  const todayRate = todayData.actual / todayTarget;

  return (
    <div className={styles.targetCard} onClick={onDrillDown} style={{ cursor: 'pointer' }}>
      <div className={styles.targetHeader}>
        <span className={styles.targetTitle}>目标达成</span>
        <SettingOutlined className={styles.targetSettings} />
      </div>
      <div className={styles.targetMain}>
        <Progress
          type="circle"
          percent={Math.round(monthRate * 100)}
          size={80}
          strokeColor={monthRate >= 0.9 ? '#38A169' : monthRate >= 0.7 ? '#ED8936' : '#E53E3E'}
          format={(p) => <span style={{ fontSize: 16, fontWeight: 600 }}>{p}%</span>}
        />
        <div className={styles.targetDetail}>
          <div className={styles.targetLine}>
            <span>本月</span>
            <span style={{ fontWeight: 600 }}>{'\u00A5'}{(monthData.actual / 10000).toFixed(1)}万</span>
            <span style={{ color: '#8c8c8c' }}>/ {'\u00A5'}{(monthTarget / 10000).toFixed(0)}万</span>
          </div>
          <div className={styles.targetLine}>
            <span>今日</span>
            <span style={{ fontWeight: 600 }}>{'\u00A5'}{(todayData.actual / 10000).toFixed(2)}万</span>
            <span style={{ color: todayRate >= 1 ? '#38A169' : '#E53E3E' }}>
              {(todayRate * 100).toFixed(1)}%
            </span>
          </div>
          <div className={styles.targetLine} style={{ color: '#3182CE', fontSize: 11, marginTop: 4 }}>
            <span>点击查看详情 &rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Target Drawer (drill-down)
   ============================================================ */
function TargetDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [customTargets, setCustomTargets] = useState<Record<string, number>>(loadTargets);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('table');

  const handleSaveTarget = useCallback((periodKey: string) => {
    const next = { ...customTargets, [periodKey]: editValue };
    setCustomTargets(next);
    saveTargets(next);
    setEditingKey(null);
  }, [customTargets, editValue]);

  const getEffectiveTarget = useCallback((item: TargetAchievement) => {
    return customTargets[item.periodKey] ?? item.target;
  }, [customTargets]);

  // Table data
  const tableData = targetAchievementData.map(item => {
    const target = getEffectiveTarget(item);
    const rate = item.actual / target;
    const prevRate = item.prevActual / target;
    const rateChange = rate - prevRate;
    return { ...item, effectiveTarget: target, effectiveRate: rate, rateChange };
  });

  const columns = [
    { title: '时段', dataIndex: 'period', key: 'period', width: 70 },
    {
      title: '目标',
      key: 'target',
      width: 160,
      render: (_: unknown, record: typeof tableData[number]) => {
        if (editingKey === record.periodKey) {
          return (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <InputNumber
                size="small"
                value={editValue}
                min={0}
                step={1000}
                style={{ width: 100 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onPressEnter={() => handleSaveTarget(record.periodKey)}
              onChange={(v) => v !== null && setEditValue(v)}
              />
              <CheckOutlined
                style={{ color: '#38A169', cursor: 'pointer' }}
                onClick={() => handleSaveTarget(record.periodKey)}
              />
              <CloseOutlined
                style={{ color: '#8c8c8c', cursor: 'pointer' }}
                onClick={() => setEditingKey(null)}
              />
            </span>
          );
        }
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {'\u00A5'}{(record.effectiveTarget / 10000).toFixed(1)}万
            <EditOutlined
              style={{ color: '#a0aec0', cursor: 'pointer', fontSize: 12 }}
              onClick={() => { setEditingKey(record.periodKey); setEditValue(record.effectiveTarget); }}
            />
          </span>
        );
      },
    },
    {
      title: '实际',
      key: 'actual',
      width: 100,
      render: (_: unknown, record: typeof tableData[number]) => `\u00A5${(record.actual / 10000).toFixed(1)}万`,
    },
    {
      title: '达成率',
      key: 'rate',
      width: 80,
      render: (_: unknown, record: typeof tableData[number]) => {
        const color = record.effectiveRate >= 1 ? '#38A169' : record.effectiveRate >= 0.8 ? '#ED8936' : '#E53E3E';
        return <span style={{ color, fontWeight: 600 }}>{(record.effectiveRate * 100).toFixed(1)}%</span>;
      },
    },
    {
      title: '环比',
      key: 'change',
      width: 80,
      render: (_: unknown, record: typeof tableData[number]) => {
        const color = record.rateChange >= 0 ? '#38A169' : '#E53E3E';
        const sign = record.rateChange >= 0 ? '+' : '';
        return <span style={{ color }}>{sign}{(record.rateChange * 100).toFixed(1)}pp</span>;
      },
    },
  ];

  // Trend chart option
  const trendOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['实际收入', '目标', '预测'], top: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 16, bottom: 24, left: 56 },
    xAxis: { type: 'category' as const, data: targetTrendData.map(d => d.date), axisLabel: { fontSize: 10 } },
    yAxis: {
      type: 'value' as const,
      axisLabel: { fontSize: 10, formatter: (v: number) => `${(v / 10000).toFixed(0)}万` },
    },
    series: [
      {
        name: '实际收入',
        type: 'bar' as const,
        data: targetTrendData.map(d => d.actual || null),
        itemStyle: { color: '#3182CE', borderRadius: [2, 2, 0, 0] },
        barMaxWidth: 12,
      },
      {
        name: '目标',
        type: 'line' as const,
        data: targetTrendData.map(d => d.target),
        lineStyle: { color: '#E53E3E', type: 'dashed' as const, width: 1.5 },
        symbol: 'none',
        itemStyle: { color: '#E53E3E' },
      },
      {
        name: '预测',
        type: 'line' as const,
        data: targetTrendData.map(d => d.predicted ?? null),
        lineStyle: { color: '#ED8936', type: 'dotted' as const, width: 2 },
        symbol: 'circle',
        symbolSize: 4,
        itemStyle: { color: '#ED8936' },
      },
    ],
  };

  // Cumulative prediction chart
  const cumOption = {
    tooltip: { trigger: 'axis' as const },
    legend: { data: ['累计实际', '累计目标', '预测轨迹'], top: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 16, bottom: 24, left: 56 },
    xAxis: {
      type: 'category' as const,
      data: monthCumulativeData.map(d => `${d.day}日`),
      axisLabel: { fontSize: 10, interval: 4 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { fontSize: 10, formatter: (v: number) => `${(v / 10000).toFixed(0)}万` },
    },
    series: [
      {
        name: '累计实际',
        type: 'line' as const,
        data: monthCumulativeData.map(d => d.cumActual || null),
        lineStyle: { color: '#3182CE', width: 2 },
        symbol: 'none',
        areaStyle: { color: 'rgba(49,130,206,0.08)' },
        itemStyle: { color: '#3182CE' },
      },
      {
        name: '累计目标',
        type: 'line' as const,
        data: monthCumulativeData.map(d => d.cumTarget),
        lineStyle: { color: '#E53E3E', type: 'dashed' as const, width: 1.5 },
        symbol: 'none',
        itemStyle: { color: '#E53E3E' },
      },
      {
        name: '预测轨迹',
        type: 'line' as const,
        data: monthCumulativeData.map(d => d.cumPredicted ?? null),
        lineStyle: { color: '#ED8936', type: 'dotted' as const, width: 2 },
        symbol: 'none',
        areaStyle: { color: 'rgba(237,137,54,0.06)' },
        itemStyle: { color: '#ED8936' },
      },
    ],
  };

  // Predicted month-end value
  const lastPredicted = monthCumulativeData.filter(d => d.cumPredicted).slice(-1)[0];
  const lastTarget = monthCumulativeData.slice(-1)[0];
  const predictedMonthEnd = lastPredicted?.cumPredicted ?? 0;
  const monthTarget = customTargets['thisMonth'] ?? lastTarget.cumTarget;
  const predictedRate = predictedMonthEnd / monthTarget;
  const gap = monthTarget - predictedMonthEnd;

  return (
    <Drawer
      title="目标达成详情"
      placement="right"
      width={620}
      open={open}
      onClose={onClose}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'table',
            label: '多时段达成',
            children: (
              <Table
                dataSource={tableData}
                columns={columns}
                rowKey="periodKey"
                pagination={false}
                size="small"
                style={{ marginBottom: 16 }}
              />
            ),
          },
          {
            key: 'trend',
            label: '趋势',
            children: (
              <ReactEChartsCore
                echarts={echarts}
                option={trendOption}
                style={{ height: 280, width: '100%' }}
                opts={{ renderer: 'canvas' }}
                notMerge
              />
            ),
          },
          {
            key: 'prediction',
            label: '预测',
            children: (
              <div>
                <div className={styles.predictionSummary}>
                  <div className={styles.predictionItem}>
                    <div className={styles.predictionLabel}>本月预测收入</div>
                    <div className={styles.predictionValue}>{'\u00A5'}{(predictedMonthEnd / 10000).toFixed(1)}万</div>
                  </div>
                  <div className={styles.predictionItem}>
                    <div className={styles.predictionLabel}>目标</div>
                    <div className={styles.predictionValue}>{'\u00A5'}{(monthTarget / 10000).toFixed(0)}万</div>
                  </div>
                  <div className={styles.predictionItem}>
                    <div className={styles.predictionLabel}>预测达成率</div>
                    <div className={styles.predictionValue} style={{
                      color: predictedRate >= 1 ? '#38A169' : predictedRate >= 0.85 ? '#ED8936' : '#E53E3E',
                    }}>
                      {(predictedRate * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className={styles.predictionItem}>
                    <div className={styles.predictionLabel}>缺口</div>
                    <div className={styles.predictionValue} style={{
                      color: gap > 0 ? '#E53E3E' : '#38A169',
                    }}>
                      {gap > 0 ? `-\u00A5${(gap / 10000).toFixed(1)}万` : '已达标'}
                    </div>
                  </div>
                </div>
                <ReactEChartsCore
                  echarts={echarts}
                  option={cumOption}
                  style={{ height: 260, width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                  notMerge
                />
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 8 }}>
                  * 预测基于当前日均收入线性外推，仅供参考。目标值可在「多时段达成」Tab 中编辑。
                </div>
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  );
}

/* ============================================================
   Five-factor Diagnosis
   ============================================================ */
function DiagnosisModule() {
  const navigate = useNavigate();

  return (
    <div className={styles.diagnosisCard}>
      <div className={styles.diagnosisTitle}>五因子诊断</div>
      <div className={styles.formulaBar}>
        <span className={styles.formulaText}>
          收入 = 有效盒子数 x 单盒UV x H5进入率 x 付费转化率 x 客单价
        </span>
      </div>
      <div className={styles.factorGrid}>
        {diagnosisFactors.map((factor, i) => (
          <FactorCard
            key={factor.key}
            factor={factor}
            isLast={i === diagnosisFactors.length - 1}
            onClick={() => navigate(factor.linkedPath)}
          />
        ))}
      </div>
      <div className={styles.diagnosisConclusion}>
        <div className={styles.conclusionTitle}>诊断结论</div>
        <div className={styles.conclusionText}>{diagnosisConclusion.text}</div>
        <div className={styles.conclusionRoot}>
          <strong>根因：</strong>{diagnosisConclusion.rootCause}
        </div>
      </div>
    </div>
  );
}

function FactorCard({
  factor,
  isLast,
  onClick,
}: {
  factor: DiagnosisFactor;
  isLast: boolean;
  onClick: () => void;
}) {
  const statusStyles: Record<string, { bg: string; border: string; color: string; badge: string }> = {
    normal: { bg: '#f0fff4', border: '#c6f6d5', color: '#38A169', badge: '正常' },
    warning: { bg: '#fffff0', border: '#fefcbf', color: '#D69E2E', badge: '关注' },
    critical: { bg: '#fff5f5', border: '#fed7d7', color: '#E53E3E', badge: '异常' },
  };
  const s = statusStyles[factor.status];
  const TrendIcon = factor.changeRate > 0 ? ArrowUpOutlined
    : factor.changeRate < 0 ? ArrowDownOutlined
    : MinusOutlined;
  const trendColor = factor.changeRate < 0 ? '#E53E3E' : factor.changeRate > 0 ? '#38A169' : '#8c8c8c';

  return (
    <>
      <div
        className={styles.factorCard}
        style={{ background: s.bg, borderColor: s.border }}
        onClick={onClick}
      >
        <div className={styles.factorHeader}>
          <span className={styles.factorName}>{factor.name}</span>
          <span className={styles.factorBadge} style={{ background: s.color }}>
            {s.badge}
          </span>
        </div>
        <div className={styles.factorValue}>
          {formatKpiValue(factor.value, factor.format)}
          {factor.unit && <span className={styles.factorUnit}>{factor.unit}</span>}
        </div>
        <div className={styles.factorChange} style={{ color: trendColor }}>
          <TrendIcon style={{ fontSize: 10, marginRight: 2 }} />
          {formatRate(Math.abs(factor.changeRate))}
        </div>
      </div>
      {!isLast && <span className={styles.factorOperator}>&times;</span>}
    </>
  );
}
