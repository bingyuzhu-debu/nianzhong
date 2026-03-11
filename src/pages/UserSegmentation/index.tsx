import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Select } from 'antd';
import { InfoCircleOutlined, AlertOutlined, WarningOutlined } from '@ant-design/icons';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, FunnelChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import KpiCard from '../../components/KpiCard';
import {
  segmentKpiData,
  segmentTrendData,
  renewalTrendData,
  expiredDurationData,
  recallFunnelData,
  recallChannelData,
  ltvDistribution,
  ltvBySegmentData,
  ltvCohortData,
  segmentAnomalyTree,
  SEGMENT_TYPES,
  vipExpiryWarningData,
} from '../../mock';
import type { SegmentType, SegmentAnomalyNode } from '../../mock';
import type { FilterState } from '../../types';
import { formatNumber, formatPercent, formatCurrency } from '../../utils/format';
import styles from './index.module.css';

echarts.use([
  LineChart, BarChart, FunnelChart,
  GridComponent, TooltipComponent, LegendComponent,
  CanvasRenderer,
]);

const SEGMENT_COLORS: Record<string, string> = {
  '新不付费': '#63B3ED',
  '老不付费': '#A0AEC0',
  '新VIP': '#48BB78',
  '老VIP': '#38A169',
  '过期用户': '#E53E3E',
};

export default function UserSegmentation() {
  const { filter } = useOutletContext<{ filter: FilterState }>();
  const [segment, setSegment] = useState<SegmentType>('全部');

  const filteredKpi = useMemo(() => {
    if (segment === '全部') return segmentKpiData;
    const ratioMap: Record<string, number> = {
      '新不付费': 0.33, '老不付费': 0.25, '新VIP': 0.12, '老VIP': 0.21, '过期用户': 0.09,
    };
    const ratio = ratioMap[segment] ?? 1;
    return segmentKpiData.map((kpi) => ({
      ...kpi,
      value: kpi.format === 'percent' || kpi.format === 'currency' ? kpi.value : Math.round(kpi.value * ratio),
      sparkline: kpi.sparkline.map((v) =>
        kpi.format === 'percent' || kpi.format === 'currency' ? v : Math.round(v * ratio)
      ),
    }));
  }, [segment]);

  const renewalKpi = segmentKpiData.find((k) => k.key === 'renewalRate')!;
  const isAbnormal = renewalKpi.changeRate <= -0.05;

  return (
    <div className={styles.page}>
      {/* 维度专属筛选器 */}
      <div className={styles.localFilter}>
        <span className={styles.filterLabel}>用户分层</span>
        <Select
          size="small"
          value={segment}
          onChange={(v) => setSegment(v as SegmentType)}
          style={{ width: 160 }}
          options={SEGMENT_TYPES.map((s) => ({ label: s, value: s }))}
        />
      </div>

      {/* 页面结论区 */}
      <div className={styles.conclusion}>
        {isAbnormal ? (
          <AlertOutlined className={styles.conclusionIcon} style={{ color: 'var(--color-danger)' }} />
        ) : (
          <InfoCircleOutlined className={styles.conclusionIcon} style={{ color: 'var(--color-primary)' }} />
        )}
        <span>
          总用户 <strong>{formatNumber(segmentKpiData[0].value)}</strong>，
          续费率 <strong>{formatPercent(renewalKpi.value)}</strong>，
          召回率 <strong>{formatPercent(segmentKpiData[2].value)}</strong>，
          LTV <strong>{formatCurrency(segmentKpiData[4].value)}</strong>
          {isAbnormal
            ? `；续费率环比下降 ${Math.abs(renewalKpi.changeRate * 100).toFixed(1)}%，过期用户堆积，需重点关注召回效率`
            : `；用户分层运行正常`}
        </span>
      </div>

      {/* KPI 卡片区 */}
      <div className={styles.kpiGrid}>
        {filteredKpi.map((kpi) => (
          <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
        ))}
      </div>

      {/* 模块A：用户分层构成 */}
      <SegmentCompositionModule segment={segment} />

      {/* 模块B：续费率 & 过期分析 */}
      <RenewalModule />

      {/* 模块B.5：VIP 到期预警 */}
      <VipExpiryWarningModule />

      {/* 模块C：过期用户召回分析 */}
      <RecallModule />

      {/* 模块D：用户 LTV 分层 */}
      <LtvModule />

      {/* 模块E：异常定位链路 */}
      <AnomalyModule />
    </div>
  );
}

/* ============================================================
   模块 A：用户分层构成
   ============================================================ */
function SegmentCompositionModule({ segment }: { segment: SegmentType }) {
  const segmentKeys = ['newFree', 'oldFree', 'newVip', 'oldVip', 'expired'] as const;
  const segmentNames = ['新不付费', '老不付费', '新VIP', '老VIP', '过期用户'];
  const segmentColors = ['#63B3ED', '#A0AEC0', '#48BB78', '#38A169', '#E53E3E'];

  const filteredKeys = segment === '全部'
    ? segmentKeys
    : [segmentKeys[segmentNames.indexOf(segment)]];
  const filteredNames = segment === '全部'
    ? segmentNames
    : [segment];
  const filteredColors = segment === '全部'
    ? segmentColors
    : [segmentColors[segmentNames.indexOf(segment)]];

  const areaOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 20, bottom: 24, left: 60 },
    xAxis: {
      type: 'category',
      data: segmentTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : String(v),
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: filteredKeys.map((key, i) => ({
      name: filteredNames[i],
      type: 'line' as const,
      stack: 'total',
      areaStyle: { opacity: 0.6 },
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5, color: filteredColors[i] },
      itemStyle: { color: filteredColors[i] },
      data: segmentTrendData.map((d) => d[key]),
    })),
  };

  const percentOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { seriesName: string; value: number; axisValue: string }[]) => {
        const total = params.reduce((s, p) => s + p.value, 0);
        let html = `${params[0].axisValue}<br/>`;
        params.forEach((p) => {
          html += `${p.seriesName}: ${formatNumber(p.value)} (${((p.value / total) * 100).toFixed(1)}%)<br/>`;
        });
        return html;
      },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 20, bottom: 24, left: 60 },
    xAxis: {
      type: 'category',
      data: segmentTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: { formatter: (v: number) => v + '%' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: segmentKeys.map((key, i) => {
      const totals = segmentTrendData.map((d) =>
        segmentKeys.reduce((s, k) => s + d[k], 0)
      );
      return {
        name: segmentNames[i],
        type: 'bar' as const,
        stack: 'percent',
        barMaxWidth: 20,
        itemStyle: { color: segmentColors[i] },
        data: segmentTrendData.map((d, j) =>
          Math.round((d[key] / totals[j]) * 10000) / 100
        ),
      };
    }),
  };

  const lastPoint = segmentTrendData[segmentTrendData.length - 1];
  const totalLast = lastPoint.newFree + lastPoint.oldFree + lastPoint.newVip + lastPoint.oldVip + lastPoint.expired;
  const expiredPct = ((lastPoint.expired / totalLast) * 100).toFixed(1);

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>用户分层构成</div>
      <div className={styles.dualChart}>
        <div>
          <div className={styles.chartSubTitle}>各类用户规模趋势（堆叠面积图）</div>
          <ReactEChartsCore
            echarts={echarts}
            option={areaOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div className={styles.chartSubTitle}>各类用户占比变化（百分比堆叠柱状图）</div>
          <ReactEChartsCore
            echarts={echarts}
            option={percentOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        过期用户占比持续上升至 {expiredPct}%，老VIP占比缓慢下降。新VIP增长稳健（环比 +5%），
        但不足以对冲过期用户的堆积。建议加强到期前续费引导和过期用户召回力度。
      </div>
    </div>
  );
}

/* ============================================================
   模块 B：续费率 & 过期分析
   ============================================================ */
function RenewalModule() {
  const lineOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    grid: { top: 20, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: renewalTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => (v * 100).toFixed(0) + '%' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'line',
      data: renewalTrendData.map((d) => d.renewalRate),
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2.5, color: '#3182CE' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(49,130,206,0.15)' },
          { offset: 1, color: 'rgba(49,130,206,0.02)' },
        ]),
      },
      itemStyle: { color: '#3182CE' },
    }],
  };

  const histogramOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    grid: { top: 20, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: expiredDurationData.map((d) => d.range),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : String(v),
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'bar',
      data: expiredDurationData.map((d, i) => ({
        value: d.count,
        itemStyle: {
          color: i >= 3 ? '#E53E3E' : i >= 2 ? '#ED8936' : '#3182CE',
        },
      })),
      barMaxWidth: 50,
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>续费率 & 过期分析</div>
      <div className={styles.dualChart}>
        <div>
          <div className={styles.chartSubTitle}>续费率趋势</div>
          <ReactEChartsCore
            echarts={echarts}
            option={lineOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div className={styles.chartSubTitle}>过期用户过期时长分布</div>
          <ReactEChartsCore
            echarts={echarts}
            option={histogramOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        续费率从 52% 持续下降至 46.8%（环比 -8%），已触发预警阈值。
        过期时长分布显示 0-7 天占比最大（28%），但 30-60 天和 60 天+ 合计占比达 27%，
        说明长期过期用户堆积严重。建议在 VIP 到期前 7 天推送续费提醒，而非到期后才触达。
      </div>
    </div>
  );
}

/* ============================================================
   模块 B.5：VIP 到期预警
   ============================================================ */
function VipExpiryWarningModule() {
  const total7d = vipExpiryWarningData.find(d => d.period === '7天内到期')!;
  const total30d = vipExpiryWarningData.find(d => d.period === '30天内到期')!;

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertOutlined style={{ color: '#ED8936' }} />
        VIP 到期预警
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {vipExpiryWarningData.map((item) => {
          const isExpired = item.period.includes('已过期');
          return (
            <div
              key={item.period}
              style={{
                background: isExpired ? '#fff5f5' : '#fffff0',
                border: `1px solid ${isExpired ? '#fed7d7' : '#fefcbf'}`,
                borderRadius: 8,
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: 12, color: '#718096', marginBottom: 4 }}>{item.period}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: isExpired ? '#E53E3E' : '#D69E2E' }}>
                {formatNumber(item.count)}
              </div>
              <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>
                预估流失 ¥{(item.estimatedRevenueLoss / 10000).toFixed(1)}万
              </div>
            </div>
          );
        })}
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>预警：</span>
        未来 7 天内将有 <strong>{formatNumber(total7d.count)}</strong> 个 VIP 到期，
        30 天内共 <strong>{formatNumber(total30d.count)}</strong> 个。
        按当前续费率 42%，预估将流失约 ¥{((total30d.estimatedRevenueLoss * 0.58) / 10000).toFixed(0)}万 收入。
        建议在到期前 3-7 天启动多渠道续费提醒（弹窗 + 消息推送），并为即将到期用户提供续费优惠。
      </div>
    </div>
  );
}

/* ============================================================
   模块 C：过期用户召回分析
   ============================================================ */
function RecallModule() {
  const maxCount = recallFunnelData[0].count;

  const funnelOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number; data: { rate: number } }) =>
        `${params.name}<br/>人数：${formatNumber(params.value)}<br/>转化率：${formatPercent(params.data.rate)}`,
    },
    series: [{
      type: 'funnel',
      left: '10%',
      top: 10,
      bottom: 10,
      width: '80%',
      min: 0,
      max: maxCount,
      minSize: '8%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
        formatter: (params: { name: string; data: { rate: number } }) =>
          `${params.name}\n${formatPercent(params.data.rate)}`,
        fontSize: 12,
        lineHeight: 18,
        color: '#fff',
      },
      labelLine: { show: false },
      itemStyle: { borderWidth: 0 },
      emphasis: { label: { fontSize: 14 } },
      data: recallFunnelData.map((node, i) => ({
        name: node.stage,
        value: node.count,
        rate: node.rate,
        itemStyle: {
          color: ['#E53E3E', '#ED8936', '#ECC94B', '#48BB78', '#38A169'][i],
        },
      })),
    }],
  };

  const trendOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: renewalTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => (v * 100).toFixed(0) + '%' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [
      {
        name: '触达率',
        type: 'line',
        data: renewalTrendData.map((d) => d.reachRate),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#ED8936' },
        itemStyle: { color: '#ED8936' },
      },
      {
        name: '召回率',
        type: 'line',
        data: renewalTrendData.map((d) => d.recallRate),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#38A169' },
        itemStyle: { color: '#38A169' },
      },
    ],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>过期用户召回分析</div>
      <div className={styles.dualChart}>
        <div>
          <div className={styles.chartSubTitle}>召回漏斗</div>
          <ReactEChartsCore
            echarts={echarts}
            option={funnelOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div className={styles.chartSubTitle}>触达率 / 召回率趋势</div>
          <ReactEChartsCore
            echarts={echarts}
            option={trendOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>

      {/* 各召回渠道效率对比表格 */}
      <table className={styles.channelTable}>
        <thead>
          <tr>
            <th>渠道</th>
            <th>触达率</th>
            <th>打开率</th>
            <th>点击率</th>
            <th>召回率</th>
            <th>单人成本</th>
          </tr>
        </thead>
        <tbody>
          {recallChannelData.map((row) => (
            <tr key={row.channel}>
              <td style={{ fontWeight: 500 }}>{row.channel}</td>
              <td>{formatPercent(row.reachRate)}</td>
              <td>{formatPercent(row.openRate)}</td>
              <td>{formatPercent(row.clickRate)}</td>
              <td style={{
                fontWeight: 600,
                color: row.recallRate >= 0.2 ? '#38A169' : '#E53E3E',
              }}>
                {formatPercent(row.recallRate)}
              </td>
              <td>{formatCurrency(row.cost)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        召回漏斗总转化率 4.6%（过期→重新购买）。触达率 72.3%，核心瓶颈在打开→点击环节（40%→40%）。
        弹窗渠道召回率最高（28%）且成本最低（¥0.10/人），但触达率仅 68%；
        短信触达率 95% 但召回率仅 8%，ROI 较低。建议优先增加弹窗频次，并优化公众号推送文案。
      </div>
    </div>
  );
}

/* ============================================================
   模块 D：用户 LTV 分层
   ============================================================ */
function LtvModule() {
  const histOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    grid: { top: 20, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: ltvDistribution.map((d) => '¥' + d.range),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : String(v),
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'bar',
      data: ltvDistribution.map((d) => d.count),
      itemStyle: { color: '#3182CE' },
      barMaxWidth: 40,
    }],
  };

  const segmentBarOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) =>
        `${params[0].name}<br/>平均LTV：${formatCurrency(params[0].value)}`,
    },
    grid: { top: 20, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: ltvBySegmentData.map((d) => d.segment),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => '¥' + v },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'bar',
      data: ltvBySegmentData.map((d) => ({
        value: d.avgLtv,
        itemStyle: { color: SEGMENT_COLORS[d.segment] || '#3182CE' },
      })),
      barMaxWidth: 60,
      label: {
        show: true,
        position: 'top',
        formatter: (params: { value: number }) => '¥' + params.value,
        fontSize: 12,
        color: '#333',
      },
    }],
  };

  const cohortColors = ['#3182CE', '#4299E1', '#63B3ED', '#38A169', '#48BB78', '#68D391'];
  const cohortOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 11 } },
    grid: { top: 36, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: ['月1', '月2', '月3', '月4', '月5', '月6'],
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (v: number) => '¥' + v },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: ltvCohortData.map((cohort, i) => ({
      name: cohort.cohort,
      type: 'line' as const,
      data: cohort.months,
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      lineStyle: { width: 2, color: cohortColors[i] },
      itemStyle: { color: cohortColors[i] },
    })),
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>用户 LTV 分层</div>
      <div className={styles.tripleChart}>
        <div>
          <div className={styles.chartSubTitle}>LTV 分布（按金额段分桶）</div>
          <ReactEChartsCore
            echarts={echarts}
            option={histOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div className={styles.chartSubTitle}>按用户分层 LTV 均值对比</div>
          <ReactEChartsCore
            echarts={echarts}
            option={segmentBarOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div className={styles.chartSubTitle}>队列分析（按首次付费月份）</div>
          <ReactEChartsCore
            echarts={echarts}
            option={cohortOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        LTV 集中在 ¥60-100 区间（占比 27.6%），整体均值 ¥118。老 VIP 平均 LTV（¥148）是新 VIP（¥82）的 1.8 倍，
        说明留存对价值贡献显著。队列分析显示近期队列（2026-01、02）首月 LTV 有上升趋势，
        获客质量改善。过期用户 LTV 均值 ¥95，仍有较高召回价值。
      </div>
    </div>
  );
}

/* ============================================================
   模块 E：异常定位链路
   ============================================================ */
function AnomalyModule() {
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>
        <WarningOutlined style={{ color: 'var(--color-danger)', marginRight: 6 }} />
        异常定位链路
      </div>
      <AnomalyTree node={segmentAnomalyTree} depth={0} />
      <div className={`${styles.insightBox} ${styles.critical}`}>
        <span className={styles.insightLabel}>定位结论：</span>
        续费率下降 8% 的根因链：消息触达率下降 12%（公众号取关率上升）导致召回率下降 6%；
        同时过期时长分布右移（60天+占比升至 11%），说明触达时机过晚。
        建议：(1) 在 VIP 到期前 7 天启动多渠道触达；(2) 优化弹窗召回策略，提高触达率；
        (3) 针对 30 天+过期用户设计专属优惠方案。
      </div>
    </div>
  );
}

function AnomalyTree({ node, depth }: { node: SegmentAnomalyNode; depth: number }) {
  return (
    <div className={depth > 0 ? styles.anomalyChildren : styles.anomalyFlow}>
      <div className={`${styles.anomalyNode} ${styles[node.status]}`}>
        <span>{node.label}</span>
        {node.value && <span className={styles.anomalyValue}>{node.value}</span>}
      </div>
      {node.children?.map((child) => (
        <div key={child.id}>
          <div className={styles.anomalyConnector} />
          <AnomalyTree node={child} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}
