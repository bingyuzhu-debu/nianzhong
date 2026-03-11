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
  funnelKpiData,
  funnelDataAll,
  funnelDataNew,
  funnelDataOld,
  durationDistribution,
  funnelTrendData,
  zeroSongProfile,
  funnelAnomalyTree,
  songCountDistribution,
  songEntryTop10,
} from '../../mock';
import type { UserType, FunnelNode, FunnelAnomalyNode } from '../../mock';
import type { FilterState } from '../../types';
import { formatNumber, formatPercent, formatRate } from '../../utils/format';
import styles from './index.module.css';

echarts.use([
  LineChart, BarChart, FunnelChart,
  GridComponent, TooltipComponent, LegendComponent,
  CanvasRenderer,
]);

export default function UserFunnel() {
  const { filter } = useOutletContext<{ filter: FilterState }>();
  const [userType, setUserType] = useState<UserType>('全部');

  const currentFunnel = useMemo(() => {
    if (userType === '新用户') return funnelDataNew;
    if (userType === '老用户') return funnelDataOld;
    return funnelDataAll;
  }, [userType]);

  const filteredKpi = useMemo(() => {
    if (userType === '全部') return funnelKpiData;
    const ratio = userType === '新用户' ? 0.38 : 0.62;
    return funnelKpiData.map((kpi) => ({
      ...kpi,
      value: kpi.format === 'percent' ? kpi.value : Math.round(kpi.value * ratio),
      sparkline: kpi.sparkline.map((v) =>
        kpi.format === 'percent' ? v : Math.round(v * ratio)
      ),
    }));
  }, [userType]);

  const payRate = funnelKpiData.find((k) => k.key === 'payRate')!;
  const scanUV = funnelKpiData.find((k) => k.key === 'scanUV')!;
  const isAbnormal = payRate.changeRate <= -0.1;

  return (
    <div className={styles.page}>
      {/* 维度专属筛选器 */}
      <div className={styles.localFilter}>
        <span className={styles.filterLabel}>用户类型</span>
        <Select
          size="small"
          value={userType}
          onChange={(v) => setUserType(v as UserType)}
          style={{ width: 140 }}
          options={[
            { label: '全部', value: '全部' },
            { label: '新用户', value: '新用户' },
            { label: '老用户', value: '老用户' },
          ]}
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
          扫码UV <strong>{formatNumber(scanUV.value)}</strong>，
          付费转化率 <strong>{formatPercent(payRate.value)}</strong>，
          {isAbnormal
            ? `环比下降 ${Math.abs(payRate.changeRate * 100).toFixed(1)}%，新用户点歌环节跌幅最大`
            : `运行正常`}
        </span>
      </div>

      {/* KPI 卡片区 */}
      <div className={styles.kpiGrid}>
        {filteredKpi.map((kpi) => (
          <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
        ))}
      </div>

      {/* 模块A：核心漏斗 */}
      <CoreFunnelModule data={currentFunnel} />

      {/* 模块B：新老用户漏斗对比 */}
      <DualFunnelModule />

      {/* 模块C：停留时长 & 页面深度 */}
      <DurationModule userType={userType} />

      {/* 模块D：零点歌用户分析 */}
      <ZeroSongModule />

      {/* 模块E：点歌数量分布 */}
      <SongCountDistributionModule />

      {/* 模块F：点歌入口 Top10 */}
      <SongEntryTop10Module />

      {/* 模块G：异常定位链路 */}
      <AnomalyModule />
    </div>
  );
}

/* ============================================================
   模块 A：核心漏斗
   ============================================================ */
function CoreFunnelModule({ data }: { data: FunnelNode[] }) {
  const maxCount = data[0].count;

  const funnelOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number; data: { rate: number } }) =>
        `${params.name}<br/>人数：${formatNumber(params.value)}<br/>转化率：${formatPercent(params.data.rate)}`,
    },
    series: [
      {
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
        itemStyle: {
          borderWidth: 0,
        },
        emphasis: {
          label: { fontSize: 14 },
        },
        data: data.map((node, i) => ({
          name: node.stage,
          value: node.count,
          rate: node.rate,
          itemStyle: {
            color: [
              '#3182CE', '#4299E1', '#63B3ED',
              '#38A169', '#48BB78', '#68D391',
            ][i],
          },
        })),
      },
    ],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>核心漏斗</div>
      <ReactEChartsCore
        echarts={echarts}
        option={funnelOption}
        style={{ height: 320 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={styles.funnelDetail}>
        {data.map((node) => (
          <div key={node.stage} className={styles.funnelRow}>
            <span className={styles.funnelStage}>{node.stage}</span>
            <span className={styles.funnelCount}>{formatNumber(node.count)}</span>
            <span className={styles.funnelRate}>{formatPercent(node.rate)}</span>
            <span
              className={styles.funnelChange}
              style={{ color: node.changeRate >= 0 ? '#38A169' : '#E53E3E' }}
            >
              {formatRate(node.changeRate)}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        漏斗整体呈标准递减形态。「点歌→浏览商品」环节转化率 50.9%，是最大的流失节点。
        付费环节环比下降 12%，需重点关注。复购率 18.5%，环比小幅上升 3%，老客忠诚度尚可。
      </div>
    </div>
  );
}

/* ============================================================
   模块 B：新老用户漏斗对比
   ============================================================ */
function DualFunnelModule() {
  const maxDiff = useMemo(() => {
    let maxIdx = 0;
    let maxVal = 0;
    funnelDataNew.forEach((node, i) => {
      if (i === 0) return;
      const diff = Math.abs(node.rate - funnelDataOld[i].rate);
      if (diff > maxVal) {
        maxVal = diff;
        maxIdx = i;
      }
    });
    return maxIdx;
  }, []);

  const makeFunnelOption = (data: FunnelNode[], color: string): echarts.EChartsCoreOption => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number; data: { rate: number } }) =>
        `${params.name}<br/>人数：${formatNumber(params.value)}<br/>转化率：${formatPercent(params.data.rate)}`,
    },
    series: [{
      type: 'funnel',
      left: '5%',
      top: 10,
      bottom: 10,
      width: '90%',
      min: 0,
      max: data[0].count,
      minSize: '8%',
      maxSize: '100%',
      sort: 'descending',
      gap: 2,
      label: {
        show: true,
        position: 'inside',
        formatter: (params: { name: string; data: { rate: number } }) =>
          `${params.name} ${formatPercent(params.data.rate)}`,
        fontSize: 11,
        color: '#fff',
      },
      labelLine: { show: false },
      itemStyle: { color, borderWidth: 0, opacity: 0.85 },
      emphasis: { label: { fontSize: 13 } },
      data: data.map((node) => ({
        name: node.stage,
        value: node.count,
        rate: node.rate,
      })),
    }],
  });

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>新老用户漏斗对比</div>
      <div className={styles.dualFunnel}>
        <div className={styles.funnelColumn}>
          <div className={styles.funnelColumnTitle}>新用户</div>
          <ReactEChartsCore
            echarts={echarts}
            option={makeFunnelOption(funnelDataNew, '#63B3ED')}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div className={styles.funnelColumn}>
          <div className={styles.funnelColumnTitle}>老用户</div>
          <ReactEChartsCore
            echarts={echarts}
            option={makeFunnelOption(funnelDataOld, '#38A169')}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={styles.funnelDetail}>
        {funnelDataNew.map((node, i) => {
          const oldNode = funnelDataOld[i];
          const isMax = i === maxDiff;
          return (
            <div
              key={node.stage}
              className={`${styles.funnelRow} ${isMax ? styles.highlight : ''}`}
            >
              <span className={styles.funnelStage}>{node.stage}</span>
              <span className={styles.funnelRate} style={{ color: '#4299E1' }}>
                新 {formatPercent(node.rate)}
              </span>
              <span className={styles.funnelRate} style={{ color: '#38A169' }}>
                老 {formatPercent(oldNode.rate)}
              </span>
              <span className={styles.funnelChange} style={{ color: '#8c8c8c' }}>
                差异 {((oldNode.rate - node.rate) * 100).toFixed(1)}pp
              </span>
            </div>
          );
        })}
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        新老用户在「{funnelDataNew[maxDiff].stage}」环节差异最大
        （新 {formatPercent(funnelDataNew[maxDiff].rate)} vs 老 {formatPercent(funnelDataOld[maxDiff].rate)}）。
        新用户付费转化率仅 13.6%，远低于老用户的 19.1%。
        建议优化新用户引导流程，尤其是点歌到商品浏览的路径。
      </div>
    </div>
  );
}

/* ============================================================
   模块 C：停留时长 & 页面深度
   ============================================================ */
function DurationModule({ userType }: { userType: UserType }) {
  const barOption: echarts.EChartsCoreOption = {
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
      data: durationDistribution.map((d) => d.range),
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
    series: userType === '全部' ? [
      {
        name: '新用户',
        type: 'bar',
        stack: 'total',
        data: durationDistribution.map((d) => d.newUsers),
        itemStyle: { color: '#63B3ED' },
        barMaxWidth: 40,
      },
      {
        name: '老用户',
        type: 'bar',
        stack: 'total',
        data: durationDistribution.map((d) => d.oldUsers),
        itemStyle: { color: '#38A169' },
        barMaxWidth: 40,
      },
    ] : [
      {
        name: userType,
        type: 'bar',
        data: durationDistribution.map((d) =>
          userType === '新用户' ? d.newUsers : d.oldUsers
        ),
        itemStyle: { color: userType === '新用户' ? '#63B3ED' : '#38A169' },
        barMaxWidth: 40,
      },
    ],
  };

  const trendOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 50, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: funnelTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: [
      {
        type: 'value',
        name: '停留时长(s)',
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      {
        type: 'value',
        name: '页面深度',
        splitLine: { show: false },
      },
    ],
    series: userType === '全部' ? [
      {
        name: '新用户时长',
        type: 'line',
        data: funnelTrendData.map((d) => d.newAvgDuration),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#63B3ED' },
        itemStyle: { color: '#63B3ED' },
      },
      {
        name: '老用户时长',
        type: 'line',
        data: funnelTrendData.map((d) => d.oldAvgDuration),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#38A169' },
        itemStyle: { color: '#38A169' },
      },
      {
        name: '页面深度',
        type: 'line',
        yAxisIndex: 1,
        data: funnelTrendData.map((d) => d.avgPageDepth),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#A0AEC0', type: 'dashed' },
        itemStyle: { color: '#A0AEC0' },
      },
    ] : [
      {
        name: `${userType}时长`,
        type: 'line',
        data: funnelTrendData.map((d) =>
          userType === '新用户' ? d.newAvgDuration : d.oldAvgDuration
        ),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: userType === '新用户' ? '#63B3ED' : '#38A169' },
        itemStyle: { color: userType === '新用户' ? '#63B3ED' : '#38A169' },
      },
      {
        name: '页面深度',
        type: 'line',
        yAxisIndex: 1,
        data: funnelTrendData.map((d) => d.avgPageDepth),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#A0AEC0', type: 'dashed' },
        itemStyle: { color: '#A0AEC0' },
      },
    ],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>停留时长 & 页面深度</div>
      <div className={styles.dualChart}>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>停留时长分布</div>
          <ReactEChartsCore
            echarts={echarts}
            option={barOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>趋势</div>
          <ReactEChartsCore
            echarts={echarts}
            option={trendOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        新用户停留时长集中在 0-30s 区间（占比 42.7%），老用户则集中在 30s+ 区间（占比 72.5%）。
        平均停留时长近 30 天下降趋势明显（从 68s 降至 62s），页面深度同步下降。
        建议优化首屏加载速度和内容吸引力。
      </div>
    </div>
  );
}

/* ============================================================
   模块 D：零点歌用户分析
   ============================================================ */
function ZeroSongModule() {
  const trendOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        return `${p.name}<br/>零点歌率：${formatPercent(p.value)}`;
      },
    },
    grid: { top: 20, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: funnelTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => (v * 100).toFixed(0) + '%',
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'line',
      data: funnelTrendData.map((d) => d.zeroSongRate),
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 2.5, color: '#E53E3E' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(229,62,62,0.15)' },
          { offset: 1, color: 'rgba(229,62,62,0.02)' },
        ]),
      },
      itemStyle: { color: '#E53E3E' },
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>零点歌用户分析</div>
      <ReactEChartsCore
        echarts={echarts}
        option={trendOption}
        style={{ height: 220 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={styles.profileGrid}>
        <div className={styles.profileItem}>
          <div className={styles.profileLabel}>新用户占比</div>
          <div className={styles.profileValue}>{formatPercent(zeroSongProfile.newUserRatio)}</div>
          <div className={styles.profileSub}>老用户 {formatPercent(zeroSongProfile.oldUserRatio)}</div>
        </div>
        <div className={styles.profileItem}>
          <div className={styles.profileLabel}>平均停留时长</div>
          <div className={styles.profileValue}>{zeroSongProfile.avgDuration}s</div>
          <div className={styles.profileSub}>远低于整体 62s</div>
        </div>
        <div className={styles.profileItem}>
          <div className={styles.profileLabel}>退出页面分布</div>
          <table className={styles.exitTable}>
            <thead>
              <tr><th>页面</th><th>占比</th></tr>
            </thead>
            <tbody>
              {zeroSongProfile.exitPages.map((p) => (
                <tr key={p.page}>
                  <td>{p.page}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div className={styles.exitBar} style={{ width: `${p.ratio * 100}px` }} />
                      <span>{formatPercent(p.ratio)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        零点歌率从 28% 攀升至 35.2%，上升趋势明显（环比 +22%）。
        零点歌用户中新用户占 62%，平均停留仅 18.5s，42% 在首页即退出。
        核心原因可能是新用户引导不足，进入 H5 后未找到点歌入口。
        建议在首页增加明显的「立即点歌」引导按钮。
      </div>
    </div>
  );
}

/* ============================================================
   模块 E：点歌数量分布
   ============================================================ */
function SongCountDistributionModule() {
  const barOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { name: string; value: number; data: { ratio: number } }[]) => {
        const p = params[0];
        return `${p.name}<br/>用户数：${formatNumber(p.value)}<br/>占比：${formatPercent(p.data.ratio)}`;
      },
    },
    grid: { top: 20, right: 20, bottom: 24, left: 60 },
    xAxis: {
      type: 'category',
      data: songCountDistribution.map((d) => d.range),
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
    series: [{
      type: 'bar',
      data: songCountDistribution.map((d, i) => ({
        value: d.count,
        ratio: d.ratio,
        itemStyle: {
          color: i === 0 ? '#E53E3E' : ['#ED8936', '#ECC94B', '#48BB78', '#3182CE'][i - 1],
        },
      })),
      barMaxWidth: 50,
      label: {
        show: true,
        position: 'top',
        formatter: (params: { data: { ratio: number } }) => formatPercent(params.data.ratio),
        fontSize: 11,
        color: '#595959',
      },
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>点歌数量分布</div>
      <ReactEChartsCore
        echarts={echarts}
        option={barOption}
        style={{ height: 280 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        0 首用户（零点歌）占比 35.2%，是最大群体。1-3 首用户占 24.0%，属于轻度参与。
        7 首以上的深度用户仅占 23.8%，但贡献了主要付费转化。
        建议针对 0 首和 1-3 首用户优化引导，提升参与深度。
      </div>
    </div>
  );
}

/* ============================================================
   模块 F：点歌入口 Top10
   ============================================================ */
function SongEntryTop10Module() {
  const barOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { name: string; value: number; data: { ratio: number; changeRate: number } }[]) => {
        const p = params[0];
        return `${p.name}<br/>点歌数：${formatNumber(p.value)}<br/>占比：${formatPercent(p.data.ratio)}<br/>环比：${formatRate(p.data.changeRate)}`;
      },
    },
    grid: { top: 10, right: 80, bottom: 10, left: 100 },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : String(v),
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: songEntryTop10.map((d) => d.entry).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#4a5568' },
    },
    series: [{
      type: 'bar',
      data: songEntryTop10.map((d) => ({
        value: d.count,
        ratio: d.ratio,
        changeRate: d.changeRate,
      })).reverse(),
      barMaxWidth: 20,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#3182CE' },
          { offset: 1, color: '#63B3ED' },
        ]),
        borderRadius: [0, 4, 4, 0],
      },
      label: {
        show: true,
        position: 'right',
        formatter: (params: { data: { ratio: number } }) => formatPercent(params.data.ratio),
        fontSize: 11,
        color: '#595959',
      },
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>点歌入口 Top10</div>
      <ReactEChartsCore
        echarts={echarts}
        option={barOption}
        style={{ height: 380 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        搜索结果页贡献 41.2% 的点歌量，是绝对主入口，说明搜索推荐算法是优化重点。
        推荐歌单占 18.0% 且环比增长 8%，AI 推荐虽然占比仅 1.0% 但增速最快（+45%），值得持续投入。
        最近播放下降 5%，可能与新用户占比上升有关。
      </div>
    </div>
  );
}

/* ============================================================
   模块 G：异常定位链路
   ============================================================ */
function AnomalyModule() {
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>
        <WarningOutlined style={{ color: 'var(--color-danger)', marginRight: 6 }} />
        异常定位链路
      </div>
      <AnomalyTree node={funnelAnomalyTree} depth={0} />
      <div className={`${styles.insightBox} ${styles.critical}`}>
        <span className={styles.insightLabel}>定位结论：</span>
        付费转化率下降 12% 的根因：新用户点歌率下降 10%（页面加载慢/引导不足），
        导致后续浏览商品和付费环节人数锐减。老用户侧零点歌率上升 22%（体验问题导致离开）
        也有贡献。建议优先优化新用户点歌引导和 H5 页面加载性能。
      </div>
    </div>
  );
}

function AnomalyTree({ node, depth }: { node: FunnelAnomalyNode; depth: number }) {
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
