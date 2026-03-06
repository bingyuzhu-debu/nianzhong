import type { KpiData } from '../types';

/* ---------- 用户分层类型 ---------- */
export type SegmentType = '全部' | '新不付费' | '老不付费' | '新VIP' | '老VIP' | '过期用户';
export const SEGMENT_TYPES: SegmentType[] = ['全部', '新不付费', '老不付费', '新VIP', '老VIP', '过期用户'];

/* ---------- 分层构成趋势点 ---------- */
export interface SegmentTrendPoint {
  date: string;
  newFree: number;
  oldFree: number;
  newVip: number;
  oldVip: number;
  expired: number;
}

/* ---------- 续费率趋势点 ---------- */
export interface RenewalTrendPoint {
  date: string;
  renewalRate: number;
  reachRate: number;
  recallRate: number;
}

/* ---------- 过期时长分布 ---------- */
export interface ExpiredDurationBucket {
  range: string;
  count: number;
}

/* ---------- 召回漏斗节点 ---------- */
export interface RecallFunnelNode {
  stage: string;
  count: number;
  rate: number;
}

/* ---------- 召回渠道效率 ---------- */
export interface RecallChannelRow {
  channel: string;
  reachRate: number;
  openRate: number;
  clickRate: number;
  recallRate: number;
  cost: number;
}

/* ---------- LTV 分布桶 ---------- */
export interface LtvBucket {
  range: string;
  count: number;
}

/* ---------- LTV 按分层均值 ---------- */
export interface LtvBySegment {
  segment: string;
  avgLtv: number;
}

/* ---------- LTV 队列曲线 ---------- */
export interface LtvCohortPoint {
  cohort: string;
  months: number[];
}

/* ---------- 异常链路节点 ---------- */
export interface SegmentAnomalyNode {
  id: string;
  label: string;
  status: 'normal' | 'abnormal' | 'root_cause';
  value?: string;
  children?: SegmentAnomalyNode[];
}

/* ---------- KPI 卡片 ---------- */
export const segmentKpiData: KpiData[] = [
  {
    key: 'totalUsers',
    name: '总用户数',
    value: 1258600,
    unit: '人',
    format: 'number',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.03,
    momRate: 0.03,
    yoyRate: 0.15,
    sparkline: [1210000, 1218000, 1226000, 1234000, 1242000, 1250000, 1258600],
    definition: '统计周期内所有分层用户的合计人数',
    linkedDimension: '用户分层',
    linkedPath: '/user-segmentation',
  },
  {
    key: 'renewalRate',
    name: '续费率',
    value: 0.468,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.08,
    momRate: -0.08,
    yoyRate: -0.03,
    sparkline: [0.510, 0.505, 0.498, 0.490, 0.482, 0.475, 0.468],
    definition: 'VIP到期后30天内续费用户数 / 同期VIP到期用户数 x 100%',
    linkedDimension: '用户分层',
    linkedPath: '/user-segmentation',
  },
  {
    key: 'recallRate',
    name: '召回率',
    value: 0.192,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.06,
    momRate: -0.06,
    yoyRate: 0.02,
    sparkline: [0.218, 0.214, 0.208, 0.204, 0.200, 0.196, 0.192],
    definition: '过期30天内重新购买VIP的用户数 / 过期用户数 x 100%',
    linkedDimension: '用户分层',
    linkedPath: '/user-segmentation',
  },
  {
    key: 'newVipRatio',
    name: '新VIP占比',
    value: 0.125,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.05,
    momRate: 0.05,
    yoyRate: 0.10,
    sparkline: [0.112, 0.114, 0.116, 0.118, 0.120, 0.122, 0.125],
    definition: '新VIP用户数 / 总用户数 x 100%',
    linkedDimension: '用户分层',
    linkedPath: '/user-segmentation',
  },
  {
    key: 'ltv',
    name: 'LTV',
    value: 118,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.04,
    momRate: 0.04,
    yoyRate: 0.12,
    sparkline: [105, 108, 110, 112, 114, 116, 118],
    definition: '用户从首次付费到最后一次付费的累计金额均值',
    linkedDimension: '用户分层',
    linkedPath: '/user-segmentation',
  },
];

/* ---------- 分层构成趋势（30天） ---------- */
function generateSegmentTrend(): SegmentTrendPoint[] {
  const data: SegmentTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');

  let newFree = 420000;
  let oldFree = 310000;
  let newVip = 145000;
  let oldVip = 268000;
  let expired = 115000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    newFree = Math.round(newFree * (1 + (Math.random() - 0.48) * 0.015));
    oldFree = Math.round(oldFree * (1 + (Math.random() - 0.50) * 0.010));
    newVip = Math.round(newVip * (1 + (Math.random() - 0.45) * 0.012));
    oldVip = Math.round(oldVip * (1 + (Math.random() - 0.52) * 0.008));
    expired = Math.round(expired * (1 + (Math.random() - 0.40) * 0.018));

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      newFree,
      oldFree,
      newVip,
      oldVip,
      expired,
    });
  }
  return data;
}

export const segmentTrendData: SegmentTrendPoint[] = generateSegmentTrend();

/* ---------- 续费率趋势（30天） ---------- */
function generateRenewalTrend(): RenewalTrendPoint[] {
  const data: RenewalTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');

  let renewalRate = 0.52;
  let reachRate = 0.78;
  let recallRate = 0.22;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // 续费率缓慢下降，模拟异常
    renewalRate = Math.max(0.40, renewalRate - 0.0015 + (Math.random() - 0.5) * 0.005);
    reachRate = Math.max(0.65, reachRate - 0.003 + (Math.random() - 0.5) * 0.008);
    recallRate = Math.max(0.15, recallRate - 0.001 + (Math.random() - 0.5) * 0.004);

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      renewalRate: Math.round(renewalRate * 1000) / 1000,
      reachRate: Math.round(reachRate * 1000) / 1000,
      recallRate: Math.round(recallRate * 1000) / 1000,
    });
  }
  return data;
}

export const renewalTrendData: RenewalTrendPoint[] = generateRenewalTrend();

/* ---------- 过期时长分布 ---------- */
export const expiredDurationData: ExpiredDurationBucket[] = [
  { range: '0-7天', count: 32500 },
  { range: '7-15天', count: 28200 },
  { range: '15-30天', count: 24800 },
  { range: '30-60天', count: 18600 },
  { range: '60天+', count: 12400 },
];

/* ---------- 召回漏斗 ---------- */
export const recallFunnelData: RecallFunnelNode[] = [
  { stage: '过期用户', count: 116500, rate: 1.0 },
  { stage: '触达', count: 84280, rate: 0.723 },
  { stage: '打开', count: 33712, rate: 0.400 },
  { stage: '点击', count: 13485, rate: 0.400 },
  { stage: '重新购买', count: 5394, rate: 0.400 },
];

/* ---------- 召回渠道效率 ---------- */
export const recallChannelData: RecallChannelRow[] = [
  { channel: '公众号', reachRate: 0.82, openRate: 0.45, clickRate: 0.18, recallRate: 0.22, cost: 0.5 },
  { channel: '短信', reachRate: 0.95, openRate: 0.12, clickRate: 0.05, recallRate: 0.08, cost: 3.5 },
  { channel: '弹窗', reachRate: 0.68, openRate: 0.72, clickRate: 0.35, recallRate: 0.28, cost: 0.1 },
];

/* ---------- LTV 分布 ---------- */
export const ltvDistribution: LtvBucket[] = [
  { range: '0-30', count: 28500 },
  { range: '30-60', count: 42300 },
  { range: '60-100', count: 56800 },
  { range: '100-150', count: 38200 },
  { range: '150-200', count: 22100 },
  { range: '200-300', count: 12400 },
  { range: '300+', count: 5800 },
];

/* ---------- 按分层 LTV 均值 ---------- */
export const ltvBySegmentData: LtvBySegment[] = [
  { segment: '新VIP', avgLtv: 82 },
  { segment: '老VIP', avgLtv: 148 },
  { segment: '过期用户', avgLtv: 95 },
];

/* ---------- LTV 队列分析 ---------- */
export const ltvCohortData: LtvCohortPoint[] = [
  { cohort: '2025-09', months: [28, 52, 78, 98, 112, 125] },
  { cohort: '2025-10', months: [30, 55, 82, 105, 118] },
  { cohort: '2025-11', months: [32, 58, 88, 110] },
  { cohort: '2025-12', months: [29, 54, 82] },
  { cohort: '2026-01', months: [31, 56] },
  { cohort: '2026-02', months: [33] },
];

/* ---------- 异常定位链路 ---------- */
export const segmentAnomalyTree: SegmentAnomalyNode = {
  id: 'renewalDown',
  label: '续费率下降',
  status: 'abnormal',
  value: '环比 -8%',
  children: [
    {
      id: 'recallDown',
      label: '过期30天内召回率下降',
      status: 'abnormal',
      value: '环比 -6%',
      children: [
        {
          id: 'reachDown',
          label: '消息触达率下降',
          status: 'root_cause',
          value: '-12%（公众号取关率上升）',
        },
        {
          id: 'openDown',
          label: '打开率下降',
          status: 'abnormal',
          value: '-8%（召回文案吸引力不足）',
        },
      ],
    },
    {
      id: 'expiredShift',
      label: '过期时长分布右移',
      status: 'abnormal',
      value: '60天+占比从8%升至11%',
      children: [
        {
          id: 'lateTrigger',
          label: '触达时机过晚',
          status: 'root_cause',
          value: '到期后才触达，建议提前7天',
        },
      ],
    },
    {
      id: 'newVipSlow',
      label: '新VIP增长放缓',
      status: 'normal',
      value: '环比 +5%（正常）',
    },
  ],
};
