import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Select, Table } from 'antd';
import { InfoCircleOutlined, AlertOutlined, WarningOutlined } from '@ant-design/icons';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  MarkAreaComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import KpiCard from '../../components/KpiCard';
import {
  adKpiData,
  adPlacements,
  AD_GROUP_OPTIONS,
  vipTrendData,
  vipRenewalData,
  adAnomalyTree,
} from '../../mock';
import type { AdPlacement, AdAnomalyNode } from '../../mock';
import type { FilterState } from '../../types';
import { formatNumber, formatPercent, formatCurrency } from '../../utils/format';
import styles from './index.module.css';

echarts.use([
  LineChart, BarChart, ScatterChart,
  GridComponent, TooltipComponent, LegendComponent,
  MarkLineComponent, MarkAreaComponent,
  CanvasRenderer,
]);

export default function AdEfficiency() {
  const { filter } = useOutletContext<{ filter: FilterState }>();
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>([]);

  const filteredPlacements = useMemo(() => {
    if (selectedAdIds.length === 0) return adPlacements;
    return adPlacements.filter((p) => selectedAdIds.includes(p.id));
  }, [selectedAdIds]);

  const totalImpressions = adKpiData.find((k) => k.key === 'totalImpressions')!;
  const avgCtrKpi = adKpiData.find((k) => k.key === 'avgCtr')!;
  const arpuKpi = adKpiData.find((k) => k.key === 'arpu')!;
  const isAbnormal = arpuKpi.changeRate <= -0.1;

  return (
    <div className={styles.page}>
      {/* 维度专属筛选器 */}
      <div className={styles.localFilter}>
        <span className={styles.filterLabel}>广告位</span>
        <Select
          mode="multiple"
          size="small"
          value={selectedAdIds}
          onChange={setSelectedAdIds}
          style={{ minWidth: 280, maxWidth: 600 }}
          placeholder="全部广告位"
          allowClear
          maxTagCount={3}
          options={AD_GROUP_OPTIONS}
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
          26个广告位总曝光 <strong>{formatNumber(totalImpressions.value)}</strong>，
          平均点击率 <strong>{formatPercent(avgCtrKpi.value)}</strong>，
          {isAbnormal
            ? `ARPU 环比下降 ${Math.abs(arpuKpi.changeRate * 100).toFixed(1)}%，已点页广告位效率下降是主因`
            : `整体运行正常`}
        </span>
      </div>

      {/* KPI 卡片区 */}
      <div className={styles.kpiGrid}>
        {adKpiData.map((kpi) => (
          <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
        ))}
      </div>

      {/* 模块A：广告位效率总览 */}
      <OverviewTableModule
        placements={filteredPlacements}
        onSelectAd={(id) => setSelectedAdIds([id])}
      />

      {/* 模块B：Top 5 广告位排名 */}
      <Top5Module onSelectAd={(id) => setSelectedAdIds([id])} />

      {/* 模块C：广告位 ROI 矩阵 */}
      <RoiMatrixModule placements={filteredPlacements} />

      {/* 模块D：VIP 用户广告打扰分析 */}
      <VipDisturbModule />

      {/* 模块E：异常定位链路 */}
      {isAbnormal && <AnomalyModule />}
    </div>
  );
}

/* ============================================================
   模块 A：广告位效率总览
   ============================================================ */
function OverviewTableModule({
  placements,
  onSelectAd,
}: {
  placements: AdPlacement[];
  onSelectAd: (id: string) => void;
}) {
  const avgImpressions = useMemo(
    () => placements.reduce((s, p) => s + p.impressions, 0) / placements.length,
    [placements],
  );
  const avgCtr = useMemo(
    () => placements.reduce((s, p) => s + p.ctr, 0) / placements.length,
    [placements],
  );
  const avgCvr = useMemo(
    () => placements.reduce((s, p) => s + p.cvr, 0) / placements.length,
    [placements],
  );
  const avgRevenue = useMemo(
    () => placements.reduce((s, p) => s + p.revenue, 0) / placements.length,
    [placements],
  );

  const getColorClass = (value: number, avg: number) =>
    value >= avg ? styles.cellAbove : styles.cellBelow;

  const columns = [
    {
      title: '广告位',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (v: string, record: AdPlacement) => (
        <span>
          <span style={{ fontSize: 11, color: '#8c8c8c', marginRight: 6 }}>[{record.group}]</span>
          {v}
        </span>
      ),
    },
    {
      title: '曝光量',
      dataIndex: 'impressions',
      key: 'impressions',
      sorter: (a: AdPlacement, b: AdPlacement) => a.impressions - b.impressions,
      render: (v: number) => (
        <span className={getColorClass(v, avgImpressions)}>{formatNumber(v)}</span>
      ),
    },
    {
      title: '点击率',
      dataIndex: 'ctr',
      key: 'ctr',
      sorter: (a: AdPlacement, b: AdPlacement) => a.ctr - b.ctr,
      render: (v: number) => (
        <span className={getColorClass(v, avgCtr)}>{formatPercent(v)}</span>
      ),
    },
    {
      title: '转化率',
      dataIndex: 'cvr',
      key: 'cvr',
      sorter: (a: AdPlacement, b: AdPlacement) => a.cvr - b.cvr,
      render: (v: number) => (
        <span className={getColorClass(v, avgCvr)}>{formatPercent(v)}</span>
      ),
    },
    {
      title: '收入',
      dataIndex: 'revenue',
      key: 'revenue',
      sorter: (a: AdPlacement, b: AdPlacement) => a.revenue - b.revenue,
      defaultSortOrder: 'descend' as const,
      render: (v: number) => (
        <span className={getColorClass(v, avgRevenue)}>{formatCurrency(v)}</span>
      ),
    },
  ];

  const topPlacement = [...placements].sort((a, b) => b.revenue - a.revenue)[0];
  const bottomPlacement = [...placements].sort((a, b) => a.revenue - b.revenue)[0];

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>广告位效率总览</div>
      <Table
        dataSource={placements}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ y: 480 }}
        onRow={(record) => ({
          onClick: () => onSelectAd(record.id),
          style: { cursor: 'pointer' },
        })}
      />
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        {placements.length} 个广告位中，收入最高的是「{topPlacement.name}」
        （{formatCurrency(topPlacement.revenue)}，点击率 {formatPercent(topPlacement.ctr)}），
        收入最低的是「{bottomPlacement.name}」（{formatCurrency(bottomPlacement.revenue)}）。
        商品页广告位整体转化率最高，扫码页曝光量大但转化率偏低，建议优化扫码页广告内容匹配度。
      </div>
    </div>
  );
}

/* ============================================================
   模块 B：Top 5 广告位排名
   ============================================================ */
function Top5Module({ onSelectAd }: { onSelectAd: (id: string) => void }) {
  const sorted = useMemo(
    () => [...adPlacements].sort((a, b) => b.revenue - a.revenue),
    [],
  );
  const top5 = sorted.slice(0, 5);
  const totalRevenue = adPlacements.reduce((s, p) => s + p.revenue, 0);
  const totalImpressions = adPlacements.reduce((s, p) => s + p.impressions, 0);

  const barOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        return `${p.name}<br/>收入：${formatCurrency(p.value)}`;
      },
    },
    grid: { top: 10, right: 80, bottom: 10, left: 180 },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatCurrency(v),
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: top5.map((p) => p.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#4a5568' },
    },
    series: [{
      type: 'bar',
      data: top5.map((p) => p.revenue).reverse(),
      barMaxWidth: 24,
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
        formatter: (params: { value: number }) => formatCurrency(params.value),
        fontSize: 11,
        color: '#595959',
      },
    }],
  };

  const compareOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 20, bottom: 24, left: 180 },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => (v * 100).toFixed(0) + '%',
        fontSize: 11,
      },
      max: 0.35,
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: top5.map((p) => p.name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#4a5568' },
    },
    series: [
      {
        name: '曝光量占比',
        type: 'bar',
        data: top5.map((p) => Math.round(p.impressions / totalImpressions * 1000) / 1000).reverse(),
        barMaxWidth: 12,
        itemStyle: { color: '#63B3ED' },
      },
      {
        name: '收入占比',
        type: 'bar',
        data: top5.map((p) => Math.round(p.revenue / totalRevenue * 1000) / 1000).reverse(),
        barMaxWidth: 12,
        itemStyle: { color: '#38A169' },
      },
    ],
  };

  const top5ImpressionShare = top5.reduce((s, p) => s + p.impressions, 0) / totalImpressions;
  const top5RevenueShare = top5.reduce((s, p) => s + p.revenue, 0) / totalRevenue;

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>Top 5 广告位排名</div>
      <ReactEChartsCore
        echarts={echarts}
        option={barOption}
        style={{ height: 220 }}
        opts={{ renderer: 'canvas' }}
        notMerge
        onEvents={{
          click: (params: { dataIndex: number }) => {
            const idx = top5.length - 1 - params.dataIndex;
            onSelectAd(top5[idx].id);
          },
        }}
      />
      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 16, marginBottom: 4 }}>
        Top 5 曝光量占比 vs 收入占比
      </div>
      <ReactEChartsCore
        echarts={echarts}
        option={compareOption}
        style={{ height: 200 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        Top 5 广告位贡献了 {formatPercent(top5RevenueShare)} 的广告收入，
        但仅占 {formatPercent(top5ImpressionShare)} 的曝光量，效率显著高于其他广告位。
        {top5[0].name} 以 {formatCurrency(top5[0].revenue)} 位居第一，
        其收入占比远高于曝光占比，说明该位置用户意图强、转化效率高。
      </div>
    </div>
  );
}

/* ============================================================
   模块 C：广告位 ROI 矩阵
   ============================================================ */
function RoiMatrixModule({ placements }: { placements: AdPlacement[] }) {
  const avgImpressions = placements.reduce((s, p) => s + p.impressions, 0) / placements.length;
  const avgCvr = placements.reduce((s, p) => s + p.cvr, 0) / placements.length;

  const quadrants = useMemo(() => {
    const star: string[] = [];
    const optimize: string[] = [];
    const potential: string[] = [];
    const low: string[] = [];
    placements.forEach((p) => {
      const highImp = p.impressions >= avgImpressions;
      const highCvr = p.cvr >= avgCvr;
      if (highImp && highCvr) star.push(p.name);
      else if (highImp && !highCvr) optimize.push(p.name);
      else if (!highImp && highCvr) potential.push(p.name);
      else low.push(p.name);
    });
    return { star, optimize, potential, low };
  }, [placements, avgImpressions, avgCvr]);

  const scatterOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { data: [number, number, string, number] }) => {
        const [imp, cvr, name, rev] = params.data;
        return `${name}<br/>曝光量：${formatNumber(imp)}<br/>转化率：${formatPercent(cvr)}<br/>收入：${formatCurrency(rev)}`;
      },
    },
    grid: { top: 20, right: 30, bottom: 40, left: 60 },
    xAxis: {
      type: 'value',
      name: '曝光量',
      nameLocation: 'center',
      nameGap: 28,
      nameTextStyle: { fontSize: 12, color: '#595959' },
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : String(v),
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'value',
      name: '转化率',
      nameTextStyle: { fontSize: 12, color: '#595959' },
      axisLabel: {
        formatter: (v: number) => (v * 100).toFixed(1) + '%',
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'scatter',
      data: placements.map((p) => [p.impressions, p.cvr, p.name, p.revenue]),
      symbolSize: (data: [number, number, string, number]) => {
        return Math.max(8, Math.min(30, Math.sqrt(data[3]) / 2));
      },
      itemStyle: {
        color: (params: { data: [number, number, string, number] }) => {
          const [imp, cvr] = params.data;
          if (imp >= avgImpressions && cvr >= avgCvr) return '#38A169';
          if (imp >= avgImpressions) return '#DD6B20';
          if (cvr >= avgCvr) return '#3182CE';
          return '#A0AEC0';
        },
      },
      markLine: {
        silent: true,
        lineStyle: { color: '#d9d9d9', type: 'dashed' },
        label: { show: false },
        data: [
          { xAxis: avgImpressions },
          { yAxis: avgCvr },
        ],
      },
      markArea: {
        silent: true,
        itemStyle: { color: 'transparent' },
        label: { fontSize: 11, color: '#bfbfbf', position: 'insideTopLeft' },
        data: [
          [
            { name: '潜力位', coord: [0, avgCvr] },
            { coord: [avgImpressions, Infinity] },
          ],
          [
            { name: '明星位', coord: [avgImpressions, avgCvr] },
            { coord: [Infinity, Infinity] },
          ],
          [
            { name: '低效位', coord: [0, 0] },
            { coord: [avgImpressions, avgCvr] },
          ],
          [
            { name: '待优化', coord: [avgImpressions, 0] },
            { coord: [Infinity, avgCvr] },
          ],
        ],
      },
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>广告位 ROI 矩阵</div>
      <ReactEChartsCore
        echarts={echarts}
        option={scatterOption}
        style={{ height: 400 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={styles.quadrantLabels}>
        <div className={styles.quadrantItem} style={{ background: '#f0fff4' }}>
          <span className={styles.quadrantDot} style={{ background: '#38A169' }} />
          <span>明星位（{quadrants.star.length}个）：高曝光高转化</span>
        </div>
        <div className={styles.quadrantItem} style={{ background: '#ebf8ff' }}>
          <span className={styles.quadrantDot} style={{ background: '#3182CE' }} />
          <span>潜力位（{quadrants.potential.length}个）：低曝光高转化，可增加曝光</span>
        </div>
        <div className={styles.quadrantItem} style={{ background: '#fffaf0' }}>
          <span className={styles.quadrantDot} style={{ background: '#DD6B20' }} />
          <span>待优化（{quadrants.optimize.length}个）：高曝光低转化，需优化内容</span>
        </div>
        <div className={styles.quadrantItem} style={{ background: '#f7fafc' }}>
          <span className={styles.quadrantDot} style={{ background: '#A0AEC0' }} />
          <span>低效位（{quadrants.low.length}个）：低曝光低转化</span>
        </div>
      </div>
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        {quadrants.star.length} 个明星位贡献了主要广告收入，
        {quadrants.potential.length} 个潜力位转化率高但曝光不足，建议适当增加这些位置的流量分配。
        {quadrants.optimize.length} 个待优化位曝光量大但转化率低于均值，
        需排查广告内容与用户意图的匹配度。
      </div>
    </div>
  );
}

/* ============================================================
   模块 D：VIP 用户广告打扰分析
   ============================================================ */
function VipDisturbModule() {
  const latestVip = vipTrendData[vipTrendData.length - 1];
  const latestNonVip = vipTrendData[vipTrendData.length - 1];

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
      data: vipTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      name: '日均广告曝光次数',
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [
      {
        name: 'VIP用户',
        type: 'line',
        data: vipTrendData.map((d) => d.vipDailyAd),
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
      },
      {
        name: '非VIP用户',
        type: 'line',
        data: vipTrendData.map((d) => d.nonVipDailyAd),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#A0AEC0' },
        itemStyle: { color: '#A0AEC0' },
      },
    ],
  };

  const maxAd = Math.max(latestVip.vipDailyAd, latestNonVip.nonVipDailyAd);
  const maxBarWidth = 300;

  const renewalOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { data: [number, number, string] }) => {
        const [exposure, renewal, month] = params.data;
        return `${month}<br/>日均曝光：${exposure}次<br/>续费率：${formatPercent(renewal)}`;
      },
    },
    grid: { top: 20, right: 30, bottom: 40, left: 60 },
    xAxis: {
      type: 'value',
      name: 'VIP日均广告曝光',
      nameLocation: 'center',
      nameGap: 28,
      nameTextStyle: { fontSize: 12, color: '#595959' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'value',
      name: '续费率',
      axisLabel: {
        formatter: (v: number) => (v * 100).toFixed(0) + '%',
        fontSize: 11,
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'scatter',
      data: vipRenewalData.map((d) => [d.avgAdExposure, d.renewalRate, d.month]),
      symbolSize: 14,
      itemStyle: {
        color: '#E53E3E',
        opacity: 0.8,
      },
      label: {
        show: true,
        position: 'right',
        formatter: (params: { data: [number, number, string] }) => params.data[2].slice(5),
        fontSize: 10,
        color: '#8c8c8c',
      },
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>VIP 用户广告打扰分析</div>
      <div className={styles.vipLayout}>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>VIP日均广告曝光趋势</div>
          <ReactEChartsCore
            echarts={echarts}
            option={trendOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>VIP广告曝光量 vs 续费率</div>
          <ReactEChartsCore
            echarts={echarts}
            option={renewalOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 12, marginBottom: 4 }}>
        VIP vs 非VIP 曝光频次对比
      </div>
      <div>
        <div className={styles.vipCompareBar}>
          <span className={styles.vipCompareLabel}>VIP</span>
          <div
            className={styles.vipBar}
            style={{
              width: `${(latestVip.vipDailyAd / maxAd) * maxBarWidth}px`,
              background: '#E53E3E',
            }}
          >
            {latestVip.vipDailyAd}次/日
          </div>
        </div>
        <div className={styles.vipCompareBar}>
          <span className={styles.vipCompareLabel}>非VIP</span>
          <div
            className={styles.vipBar}
            style={{
              width: `${(latestNonVip.nonVipDailyAd / maxAd) * maxBarWidth}px`,
              background: '#A0AEC0',
            }}
          >
            {latestNonVip.nonVipDailyAd}次/日
          </div>
        </div>
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        VIP 用户日均广告曝光从 4.2 次升至 {latestVip.vipDailyAd} 次（环比 +{((latestVip.vipDailyAd / 4.2 - 1) * 100).toFixed(0)}%），
        上升趋势明显。同时 VIP 续费率从 78% 下降至 65%，广告曝光量与续费率呈负相关。
        建议对 VIP 用户实施广告频控策略，将日均曝光控制在 3 次以内，
        以降低打扰度、保护续费率。
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
      <AnomalyTree node={adAnomalyTree} depth={0} />
      <div className={`${styles.insightBox} ${styles.critical}`}>
        <span className={styles.insightLabel}>定位结论：</span>
        ARPU 下降 11% 的根因：付费频次下降 9.5%，其中已点页广告位效率下降最严重
        （转化率 -35%，用户点完歌就走导致广告曝光不足），H5 首页弹窗点击率下降 22%
        （弹窗疲劳）也有贡献。客单价基本不变，排除定价因素。
        建议优化已点页广告展示时机，减少 H5 首页弹窗频次或更新弹窗创意。
      </div>
    </div>
  );
}

function AnomalyTree({ node, depth }: { node: AdAnomalyNode; depth: number }) {
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
