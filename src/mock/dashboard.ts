import type { KpiData, AlertItem, RevenueTrendPoint, RadarDimension } from '../types';

export const kpiData: KpiData[] = [
  {
    key: 'activeBoxes',
    name: '有效盒子数',
    value: 45832,
    unit: '台',
    format: 'number',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.12,
    momRate: -0.12,
    yoyRate: 0.05,
    sparkline: [44200, 44800, 45100, 45600, 46200, 45900, 45832],
    definition: '统计周期内产生过扫码行为的盒子总数',
    linkedDimension: '设备效率',
    linkedPath: '/device-efficiency',
  },
  {
    key: 'scanUV',
    name: '扫码UV',
    value: 1283400,
    unit: '人',
    format: 'number',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.08,
    momRate: 0.08,
    yoyRate: 0.15,
    sparkline: [1180000, 1205000, 1230000, 1255000, 1268000, 1275000, 1283400],
    definition: '统计周期内扫码进入H5的独立用户数（按user_id去重）',
    linkedDimension: '用户分析',
    linkedPath: '/user-analysis',
  },
  {
    key: 'conversionRate',
    name: '付费转化率',
    value: 0.052,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.08,
    momRate: -0.08,
    yoyRate: -0.03,
    sparkline: [0.056, 0.055, 0.054, 0.053, 0.053, 0.052, 0.052],
    definition: '付费用户数 / 扫码UV × 100%',
    linkedDimension: '用户分析',
    linkedPath: '/user-analysis',
  },
  {
    key: 'avgOrderValue',
    name: '客单价',
    value: 21.5,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.06,
    momRate: -0.06,
    yoyRate: -0.02,
    sparkline: [23.1, 22.8, 22.5, 22.0, 21.8, 21.6, 21.5],
    definition: '总收入 / 付费用户数',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
  {
    key: 'totalRevenue',
    name: '总收入',
    value: 1435280,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.03,
    momRate: 0.03,
    yoyRate: 0.12,
    sparkline: [1350000, 1370000, 1390000, 1410000, 1420000, 1430000, 1435280],
    definition: '统计周期内所有付费订单金额之和（扣除退款）',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
  {
    key: 'newUserRatio',
    name: '新用户占比',
    value: 0.38,
    unit: '',
    format: 'percent',
    polarity: 'neutral',
    trend: 'up',
    changeRate: 0.04,
    momRate: 0.04,
    yoyRate: 0.02,
    sparkline: [0.35, 0.36, 0.36, 0.37, 0.37, 0.38, 0.38],
    definition: '首次扫码用户数 / 扫码UV × 100%',
    linkedDimension: '用户分析',
    linkedPath: '/user-analysis',
  },
  {
    key: 'renewalRate',
    name: '续费率',
    value: 0.42,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.03,
    momRate: -0.03,
    yoyRate: -0.01,
    sparkline: [0.44, 0.43, 0.43, 0.43, 0.42, 0.42, 0.42],
    definition: 'VIP到期后30天内续费用户数 / 同期VIP到期用户数 × 100%',
    linkedDimension: '用户分析',
    linkedPath: '/user-analysis',
  },
  {
    key: 'refundRate',
    name: '退款率',
    value: 0.032,
    unit: '',
    format: 'percent',
    polarity: 'negative',
    trend: 'up',
    changeRate: 0.15,
    momRate: 0.15,
    yoyRate: 0.08,
    sparkline: [0.025, 0.026, 0.027, 0.028, 0.029, 0.031, 0.032],
    definition: '退款订单数 / 总订单数 × 100%',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
  {
    key: 'arpu',
    name: 'ARPU',
    value: 1.12,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.09,
    momRate: -0.09,
    yoyRate: -0.05,
    sparkline: [1.25, 1.22, 1.20, 1.18, 1.15, 1.13, 1.12],
    definition: '总收入 / 扫码UV',
    linkedDimension: '广告位效率',
    linkedPath: '/ad-efficiency',
  },
  {
    key: 'ltv',
    name: 'LTV',
    value: 68.5,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.06,
    momRate: 0.06,
    yoyRate: 0.18,
    sparkline: [62.0, 63.5, 64.8, 65.5, 66.8, 67.5, 68.5],
    definition: '用户从首次付费到最后一次付费的累计金额均值（按用户队列统计）',
    linkedDimension: '用户分析',
    linkedPath: '/user-analysis',
  },
];

function generateTrendData(): RevenueTrendPoint[] {
  const data: RevenueTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');
  let revenue = 42000;
  let uv = 38000;
  let payingUsers = 2100;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const revFactor = isWeekend ? 1.3 + Math.random() * 0.2 : 0.85 + Math.random() * 0.3;
    revenue = Math.round(revenue * (0.98 + Math.random() * 0.06) * revFactor / (isWeekend ? 1.3 : 0.95));
    uv = Math.round(uv * (0.97 + Math.random() * 0.07));
    payingUsers = Math.round(uv * (0.045 + Math.random() * 0.015));

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      revenue: Math.round(revenue),
      uv: Math.round(uv),
      payingUsers,
    });
  }
  return data;
}

export const revenueTrendData: RevenueTrendPoint[] = generateTrendData();

export const alertData: AlertItem[] = [
  {
    dimension: '设备效率',
    level: 'critical',
    description: '有效盒子数环比下降12%，雷客盒子批量离线',
    metric: '有效盒子数',
    changeRate: -0.12,
    path: '/device-efficiency',
  },
  {
    dimension: '用户分析(漏斗)',
    level: 'warning',
    description: '付费转化率环比下降8%，新用户转化率跌幅最大',
    metric: '付费转化率',
    changeRate: -0.08,
    path: '/user-analysis',
  },
  {
    dimension: '营收结构',
    level: 'normal',
    description: '总收入小幅增长3%，客单价微降但付费用户数增加',
    metric: '总收入',
    changeRate: 0.03,
    path: '/revenue-structure',
  },
  {
    dimension: '用户分析(分层)',
    level: 'normal',
    description: '续费率42%保持稳定，新VIP用户持续增长',
    metric: '续费率',
    changeRate: -0.03,
    path: '/user-analysis',
  },
  {
    dimension: '广告位效率',
    level: 'warning',
    description: 'ARPU环比下降9%，首页弹窗点击率持续走低',
    metric: 'ARPU',
    changeRate: -0.09,
    path: '/ad-efficiency',
  },
];

export const radarData: RadarDimension[] = [
  { dimension: '设备效率', score: 68, prevScore: 78, path: '/device-efficiency' },
  { dimension: '用户分析(漏斗)', score: 72, prevScore: 79, path: '/user-analysis' },
  { dimension: '营收结构', score: 85, prevScore: 82, path: '/revenue-structure' },
  { dimension: '用户分析(分层)', score: 76, prevScore: 78, path: '/user-analysis' },
  { dimension: '广告位效率', score: 65, prevScore: 72, path: '/ad-efficiency' },
];

// ============ 五因子诊断数据 ============
export type FactorStatus = 'normal' | 'warning' | 'critical';

export interface DiagnosisFactor {
  key: string;
  name: string;
  value: number;
  unit: string;
  format: 'number' | 'percent' | 'currency';
  changeRate: number;
  status: FactorStatus;
  statusLabel: string;
  definition: string;
  linkedPath: string;
}

export const diagnosisFactors: DiagnosisFactor[] = [
  {
    key: 'activeBoxes',
    name: '有效盒子数',
    value: 45832,
    unit: '台',
    format: 'number',
    changeRate: -0.12,
    status: 'critical',
    statusLabel: '异常',
    definition: '统计周期内产生过扫码行为的盒子总数',
    linkedPath: '/device-efficiency',
  },
  {
    key: 'uvPerBox',
    name: '单盒UV',
    value: 28.0,
    unit: '人/台',
    format: 'number',
    changeRate: 0.03,
    status: 'normal',
    statusLabel: '正常',
    definition: '扫码UV / 有效盒子数',
    linkedPath: '/user-analysis',
  },
  {
    key: 'h5EntryRate',
    name: 'H5进入率',
    value: 0.82,
    unit: '',
    format: 'percent',
    changeRate: -0.02,
    status: 'normal',
    statusLabel: '正常',
    definition: '进入H5页面的UV / 扫码UV',
    linkedPath: '/user-analysis',
  },
  {
    key: 'payConvRate',
    name: '付费转化率',
    value: 0.052,
    unit: '',
    format: 'percent',
    changeRate: -0.08,
    status: 'warning',
    statusLabel: '关注',
    definition: '付费用户数 / H5进入UV',
    linkedPath: '/user-analysis',
  },
  {
    key: 'avgOrderValue',
    name: '客单价',
    value: 21.5,
    unit: '元',
    format: 'currency',
    changeRate: -0.06,
    status: 'warning',
    statusLabel: '关注',
    definition: '总收入 / 付费用户数',
    linkedPath: '/revenue-structure',
  },
];

export interface DiagnosisConclusion {
  text: string;
  rootCause: string;
  factors: string[];
}

export const diagnosisConclusion: DiagnosisConclusion = {
  text: '当前收入 ¥143.5万，环比增长 3%。',
  rootCause: '有效盒子数环比下降 12%（雷客盒子批量离线），付费转化率环比下降 8%（新用户点歌引导不足），客单价微降 6%（1天包占比上升）。',
  factors: ['activeBoxes', 'payConvRate', 'avgOrderValue'],
};

// ============ 目标达成率数据 ============
export interface TargetAchievement {
  period: string;
  target: number;
  actual: number;
  rate: number;
}

export const targetAchievementData: TargetAchievement[] = [
  { period: '日', target: 50000, actual: 47843, rate: 0.957 },
  { period: '周', target: 350000, actual: 328500, rate: 0.939 },
  { period: '月', target: 1500000, actual: 1435280, rate: 0.957 },
  { period: '年', target: 18000000, actual: 14352800, rate: 0.798 },
];

// ============ 人均点歌 KPI ============
export const avgSongsPerUserKpi: KpiData = {
  key: 'avgSongsPerUser',
  name: '人均点歌数',
  value: 3.8,
  unit: '首',
  format: 'number',
  polarity: 'positive',
  trend: 'down',
  changeRate: -0.05,
  momRate: -0.05,
  yoyRate: 0.02,
  sparkline: [4.2, 4.1, 4.0, 3.9, 3.9, 3.8, 3.8],
  definition: '点歌总数 / 扫码UV',
  linkedDimension: '用户分析',
  linkedPath: '/user-analysis',
};
