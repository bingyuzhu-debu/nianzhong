import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Select } from 'antd';
import { InfoCircleOutlined, AlertOutlined, WarningOutlined } from '@ant-design/icons';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import KpiCard from '../../components/KpiCard';
import {
  revenueKpiData,
  revenueSourceTrendData,
  revenueSourcePie,
  packageTrendData,
  packageTableData,
  unitPriceTrendData,
  scatterData,
  paymentChannelData,
  refundTrendData,
  refundReasonData,
  refundPackageData,
  revenueAnomalyTree,
  PAYMENT_CHANNELS,
} from '../../mock';
import type {
  RevenueUserType,
  PackageCategory,
  PaymentChannel,
  RevenueAnomalyNode,
} from '../../mock';
import type { FilterState } from '../../types';
import { formatNumber, formatPercent, formatCurrency, formatRate } from '../../utils/format';
import styles from './index.module.css';

echarts.use([
  LineChart, BarChart, PieChart, ScatterChart,
  GridComponent, TooltipComponent, LegendComponent,
  CanvasRenderer,
]);

export default function RevenueStructure() {
  const { filter } = useOutletContext<{ filter: FilterState }>();
  const [userType, setUserType] = useState<RevenueUserType>('全部');
  const [packageType, setPackageType] = useState<PackageCategory>('全部');
  const [payChannel, setPayChannel] = useState<PaymentChannel>('全部');

  const filteredKpi = useMemo(() => {
    if (userType === '全部') return revenueKpiData;
    const ratio = userType === '新用户' ? 0.40 : 0.60;
    return revenueKpiData.map((kpi) => ({
      ...kpi,
      value: kpi.format === 'percent' ? kpi.value : Math.round(kpi.value * ratio),
      sparkline: kpi.sparkline.map((v) =>
        kpi.format === 'percent' ? v : Math.round(v * ratio)
      ),
    }));
  }, [userType]);

  const totalRevKpi = revenueKpiData.find((k) => k.key === 'totalRevenue')!;
  const unitPriceKpi = revenueKpiData.find((k) => k.key === 'unitPrice')!;
  const isAbnormal = unitPriceKpi.changeRate <= -0.05;

  return (
    <div className={styles.page}>
      {/* 维度专属筛选器 */}
      <div className={styles.localFilter}>
        <span className={styles.filterLabel}>用户类型</span>
        <Select
          size="small"
          value={userType}
          onChange={(v) => setUserType(v as RevenueUserType)}
          style={{ width: 120 }}
          options={[
            { label: '全部', value: '全部' },
            { label: '新用户', value: '新用户' },
            { label: '老用户', value: '老用户' },
          ]}
        />
        <span className={styles.filterLabel}>套餐类型</span>
        <Select
          size="small"
          value={packageType}
          onChange={(v) => setPackageType(v as PackageCategory)}
          style={{ width: 120 }}
          options={[
            { label: '全部', value: '全部' },
            { label: 'VIP会员', value: 'VIP会员' },
            { label: '单项服务', value: '单项服务' },
          ]}
        />
        <span className={styles.filterLabel}>支付入口</span>
        <Select
          size="small"
          value={payChannel}
          onChange={(v) => setPayChannel(v as PaymentChannel)}
          style={{ width: 120 }}
          options={PAYMENT_CHANNELS.map((c) => ({ label: c, value: c }))}
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
          总收入 <strong>{formatCurrency(totalRevKpi.value)}</strong>，
          客单价 <strong>{formatCurrency(unitPriceKpi.value)}</strong>，
          {isAbnormal
            ? `客单价环比下降 ${Math.abs(unitPriceKpi.changeRate * 100).toFixed(1)}%，1天包占比上升是主因`
            : `营收运行正常`}
        </span>
      </div>

      {/* KPI 卡片区 */}
      <div className={styles.kpiGrid}>
        {filteredKpi.map((kpi) => (
          <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
        ))}
      </div>

      {/* 模块A：收入来源拆解 */}
      <RevenueSourceModule packageType={packageType} />

      {/* 模块B：套餐结构分析 */}
      <PackageModule packageType={packageType} />

      {/* 模块C：客单价分析 */}
      <UnitPriceModule userType={userType} />

      {/* 模块D：支付入口效率 */}
      <PaymentChannelModule payChannel={payChannel} />

      {/* 模块E：退款分析 */}
      <RefundModule />

      {/* 模块F：异常定位链路 */}
      <AnomalyModule />
    </div>
  );
}

/* ============================================================
   模块 A：收入来源拆解
   ============================================================ */
function RevenueSourceModule({ packageType }: { packageType: PackageCategory }) {
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
      data: revenueSourceTrendData.map((d) => d.date),
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
    series: packageType === '单项服务' ? [
      {
        name: '单项服务收入',
        type: 'line',
        stack: 'total',
        areaStyle: { opacity: 0.4 },
        data: revenueSourceTrendData.map((d) => d.serviceRevenue),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#ED8936' },
        itemStyle: { color: '#ED8936' },
      },
    ] : packageType === 'VIP会员' ? [
      {
        name: 'VIP会员收入',
        type: 'line',
        stack: 'total',
        areaStyle: { opacity: 0.4 },
        data: revenueSourceTrendData.map((d) => d.vipRevenue),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#3182CE' },
        itemStyle: { color: '#3182CE' },
      },
    ] : [
      {
        name: 'VIP会员收入',
        type: 'line',
        stack: 'total',
        areaStyle: { opacity: 0.4 },
        data: revenueSourceTrendData.map((d) => d.vipRevenue),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#3182CE' },
        itemStyle: { color: '#3182CE' },
      },
      {
        name: '单项服务收入',
        type: 'line',
        stack: 'total',
        areaStyle: { opacity: 0.4 },
        data: revenueSourceTrendData.map((d) => d.serviceRevenue),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#ED8936' },
        itemStyle: { color: '#ED8936' },
      },
    ],
  };

  const pieOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number; percent: number }) =>
        `${params.name}<br/>${formatCurrency(params.value)}（${params.percent}%）`,
    },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 11,
      },
      data: revenueSourcePie.map((d, i) => ({
        ...d,
        itemStyle: {
          color: ['#3182CE', '#48BB78', '#ED8936', '#A0AEC0'][i],
        },
      })),
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>收入来源拆解</div>
      <div className={styles.dualChart}>
        <div>
          <div className={styles.chartSubTitle}>收入趋势</div>
          <ReactEChartsCore
            echarts={echarts}
            option={areaOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div className={styles.chartSubTitle}>当前周期收入来源占比</div>
          <ReactEChartsCore
            echarts={echarts}
            option={pieOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        VIP会员收入占比 74.2%，仍为营收主力，但占比环比下降 3pp。
        单项服务收入（照片上屏、特效礼物）增速较快（环比 +12%、+8%），
        正逐步成为新的增长点。建议关注 VIP 套餐的定价策略调整对整体收入结构的影响。
      </div>
    </div>
  );
}

/* ============================================================
   模块 B：套餐结构分析
   ============================================================ */
function PackageModule({ packageType }: { packageType: PackageCategory }) {
  const filteredTable = useMemo(() => {
    if (packageType === '全部') return packageTableData;
    return packageTableData.filter((r) => r.category === packageType);
  }, [packageType]);

  const filteredSeriesKeys = useMemo(() => {
    const keys = Object.keys(packageTrendData.series);
    if (packageType === 'VIP会员') return keys.filter((k) => ['1天包', '7天包', '30天包', '90天包', '365天包'].includes(k));
    if (packageType === '单项服务') return keys.filter((k) => ['照片上屏', '特效礼物', '其他增值服务'].includes(k));
    return keys;
  }, [packageType]);

  const colors = ['#3182CE', '#4299E1', '#63B3ED', '#90CDF4', '#BEE3F8', '#48BB78', '#ED8936', '#A0AEC0'];

  const barOption: echarts.EChartsCoreOption = {
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
      data: packageTrendData.dates,
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      max: 1,
      axisLabel: {
        formatter: (v: number) => (v * 100).toFixed(0) + '%',
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: filteredSeriesKeys.map((key, i) => ({
      name: key,
      type: 'bar',
      stack: 'total',
      data: packageTrendData.series[key],
      itemStyle: { color: colors[i % colors.length] },
      barMaxWidth: 20,
    })),
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>套餐结构分析</div>
      <ReactEChartsCore
        echarts={echarts}
        option={barOption}
        style={{ height: 300 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <table className={styles.dataTable}>
        <thead>
          <tr>
            <th>套餐名称</th>
            <th>类型</th>
            <th className={styles.numCell}>销量</th>
            <th className={styles.numCell}>收入</th>
            <th className={styles.numCell}>占比</th>
            <th className={styles.numCell}>环比</th>
          </tr>
        </thead>
        <tbody>
          {filteredTable.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.category}</td>
              <td className={styles.numCell}>{formatNumber(row.sales)}</td>
              <td className={styles.numCell}>{formatCurrency(row.revenue)}</td>
              <td className={styles.numCell}>{formatPercent(row.share)}</td>
              <td className={`${styles.numCell} ${row.momChange >= 0 ? styles.positive : styles.negative}`}>
                {formatRate(row.momChange)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        1天包销量环比大增 15%，占比提升至 20.7%，成为销量最大的VIP套餐。
        30天包销量下降 6%，90天包、365天包持续萎缩。
        低价套餐占比上升是客单价下降的直接原因。
        需检查近期是否有促销活动导致用户选择低价套餐代替长期套餐。
      </div>
    </div>
  );
}

/* ============================================================
   模块 C：客单价分析
   ============================================================ */
function UnitPriceModule({ userType }: { userType: RevenueUserType }) {
  const lineOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { seriesName: string; value: number; axisValue: string }[]) => {
        let s = params[0].axisValue + '<br/>';
        for (const p of params) {
          s += `${p.seriesName}：¥${p.value}<br/>`;
        }
        return s;
      },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 20, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: unitPriceTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      name: '¥',
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: userType === '全部' ? [
      {
        name: '整体客单价',
        type: 'line',
        data: unitPriceTrendData.map((d) => d.overall),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2.5, color: '#3182CE' },
        itemStyle: { color: '#3182CE' },
      },
      {
        name: '新用户客单价',
        type: 'line',
        data: unitPriceTrendData.map((d) => d.newUser),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#63B3ED', type: 'dashed' },
        itemStyle: { color: '#63B3ED' },
      },
      {
        name: '老用户客单价',
        type: 'line',
        data: unitPriceTrendData.map((d) => d.oldUser),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#38A169', type: 'dashed' },
        itemStyle: { color: '#38A169' },
      },
    ] : [
      {
        name: `${userType}客单价`,
        type: 'line',
        data: unitPriceTrendData.map((d) =>
          userType === '新用户' ? d.newUser : d.oldUser
        ),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2.5, color: userType === '新用户' ? '#63B3ED' : '#38A169' },
        itemStyle: { color: userType === '新用户' ? '#63B3ED' : '#38A169' },
      },
    ],
  };

  const scatterOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { value: number[] }) => {
        const [price, freq, count] = params.value;
        return `客单价：¥${price}<br/>付费频次：${freq}次<br/>用户数：${formatNumber(count)}`;
      },
    },
    grid: { top: 20, right: 20, bottom: 30, left: 50 },
    xAxis: {
      type: 'value',
      name: '客单价(¥)',
      nameTextStyle: { fontSize: 11, color: '#8c8c8c' },
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
      splitLine: { lineStyle: { color: '#f5f5f5' } },
    },
    yAxis: {
      type: 'value',
      name: '付费频次',
      nameTextStyle: { fontSize: 11, color: '#8c8c8c' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'scatter',
      data: scatterData.map((d) => [d.unitPrice, d.frequency, d.userCount]),
      symbolSize: (val: number[]) => Math.max(6, Math.sqrt(val[2]) * 1.2),
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#63B3ED' },
          { offset: 1, color: '#3182CE' },
        ]),
        opacity: 0.7,
      },
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>客单价分析</div>
      <div className={styles.dualChart}>
        <div>
          <div className={styles.chartSubTitle}>客单价趋势</div>
          <ReactEChartsCore
            echarts={echarts}
            option={lineOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
        <div>
          <div className={styles.chartSubTitle}>客单价 vs 付费频次</div>
          <ReactEChartsCore
            echarts={echarts}
            option={scatterOption}
            style={{ height: 280 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        整体客单价从 ¥42.1 下降至 ¥38.5（环比 -8%），第 15 天后下降加速。
        新用户客单价 ¥{unitPriceTrendData[unitPriceTrendData.length - 1].newUser} 远低于老用户
        ¥{unitPriceTrendData[unitPriceTrendData.length - 1].oldUser}。
        散点图显示高频付费用户（{'>'}5次）客单价集中在 ¥50-120 区间，是高价值用户群。
        客单价下降主因是 1 天包低价套餐占比上升，而非用户结构变化。
      </div>
    </div>
  );
}

/* ============================================================
   模块 D：支付入口效率
   ============================================================ */
function PaymentChannelModule({ payChannel }: { payChannel: PaymentChannel }) {
  const filteredData = useMemo(() => {
    if (payChannel === '全部') return paymentChannelData;
    return paymentChannelData.filter((r) => r.channel === payChannel);
  }, [payChannel]);

  const barOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
      formatter: (params: { name: string; value: number }[]) => {
        const p = params[0];
        return `${p.name}<br/>转化率：${formatPercent(p.value)}`;
      },
    },
    grid: { top: 20, right: 20, bottom: 30, left: 80 },
    xAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatPercent(v),
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    yAxis: {
      type: 'category',
      data: filteredData.map((d) => d.channel),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 12, color: '#4a5568' },
    },
    series: [{
      type: 'bar',
      data: filteredData.map((d, i) => ({
        value: d.conversionRate,
        itemStyle: {
          color: ['#3182CE', '#4299E1', '#63B3ED', '#48BB78', '#A0AEC0'][i],
          borderRadius: [0, 4, 4, 0],
        },
      })),
      barMaxWidth: 28,
      label: {
        show: true,
        position: 'right',
        formatter: (params: { value: number }) => formatPercent(params.value),
        fontSize: 11,
        color: '#4a5568',
      },
    }],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>支付入口效率</div>
      <div className={styles.dualChart}>
        <div>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>支付入口</th>
                <th className={styles.numCell}>UV</th>
                <th className={styles.numCell}>转化率</th>
                <th className={styles.numCell}>收入</th>
                <th className={styles.numCell}>占比</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.channel}>
                  <td>{row.channel}</td>
                  <td className={styles.numCell}>{formatNumber(row.uv)}</td>
                  <td className={styles.numCell}>{formatPercent(row.conversionRate)}</td>
                  <td className={styles.numCell}>{formatCurrency(row.revenue)}</td>
                  <td className={styles.numCell}>{formatPercent(row.share)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className={styles.chartSubTitle}>各入口转化率对比</div>
          <ReactEChartsCore
            echarts={echarts}
            option={barOption}
            style={{ height: 260 }}
            opts={{ renderer: 'canvas' }}
            notMerge
          />
        </div>
      </div>
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        APP内购转化率最高（7.2%），但UV最低（4.2万），收入贡献仅 9.1%。
        扫码支付为第一大入口（UV 24.5万），转化率 6.8%，贡献 46.1% 的收入。
        公众号入口转化率最低（3.8%），建议优化公众号支付流程或调整引导策略。
      </div>
    </div>
  );
}

/* ============================================================
   模块 E：退款分析
   ============================================================ */
function RefundModule() {
  const lineOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 60, bottom: 24, left: 50 },
    xAxis: {
      type: 'category',
      data: refundTrendData.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: [
      {
        type: 'value',
        name: '退款率',
        axisLabel: {
          formatter: (v: number) => (v * 100).toFixed(1) + '%',
        },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      {
        type: 'value',
        name: '退款金额(¥)',
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '退款率',
        type: 'line',
        data: refundTrendData.map((d) => d.refundRate),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2.5, color: '#E53E3E' },
        itemStyle: { color: '#E53E3E' },
      },
      {
        name: '退款金额',
        type: 'line',
        yAxisIndex: 1,
        data: refundTrendData.map((d) => d.refundAmount),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#ED8936', type: 'dashed' },
        itemStyle: { color: '#ED8936' },
      },
    ],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>退款分析</div>
      <ReactEChartsCore
        echarts={echarts}
        option={lineOption}
        style={{ height: 260 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={styles.dualChart}>
        <div>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>退款原因</th>
                <th className={styles.numCell}>数量</th>
                <th className={styles.numCell}>占比</th>
              </tr>
            </thead>
            <tbody>
              {refundReasonData.map((row) => (
                <tr key={row.reason}>
                  <td>{row.reason}</td>
                  <td className={styles.numCell}>{formatNumber(row.count)}</td>
                  <td className={styles.numCell}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                      <div className={styles.shareBar} style={{ width: `${row.share * 100}px` }} />
                      <span>{formatPercent(row.share)}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>退款套餐</th>
                <th className={styles.numCell}>数量</th>
                <th className={styles.numCell}>金额</th>
                <th className={styles.numCell}>占比</th>
              </tr>
            </thead>
            <tbody>
              {refundPackageData.map((row) => (
                <tr key={row.packageName}>
                  <td>{row.packageName}</td>
                  <td className={styles.numCell}>{formatNumber(row.count)}</td>
                  <td className={styles.numCell}>{formatCurrency(row.amount)}</td>
                  <td className={styles.numCell}>{formatPercent(row.share)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        退款率从 2.0% 上升至 2.5%（环比 +18%），第 20 天后上升明显。
        「误操作购买」占退款原因 35%，是首要退款原因，建议在支付确认环节增加二次确认。
        1天包退款占比 44%，与其销量上升趋势一致。
        退款金额累计 ¥4.64万，占总收入 2.5%，需持续监控。
      </div>
    </div>
  );
}

/* ============================================================
   模块 F：异常定位链路
   ============================================================ */
function AnomalyModule() {
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>
        <WarningOutlined style={{ color: 'var(--color-danger)', marginRight: 6 }} />
        异常定位链路
      </div>
      <AnomalyTree node={revenueAnomalyTree} depth={0} />
      <div className={`${styles.insightBox} ${styles.critical}`}>
        <span className={styles.insightLabel}>定位结论：</span>
        客单价下降 8% 的根因：套餐结构变化（1天包占比上升 5pp），
        而非用户结构变化（新用户占比仅 +2pp）。
        深层原因：新用户倾向选择低价体验套餐（1天包购买量 +25%），
        同时近期促销活动导致老用户从 30天包降档至 7天包（迁移率 12%）。
        建议：减少短期大幅折扣促销，设计「体验→升档」引导路径。
      </div>
    </div>
  );
}

function AnomalyTree({ node, depth }: { node: RevenueAnomalyNode; depth: number }) {
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
