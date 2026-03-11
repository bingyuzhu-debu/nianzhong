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
    key: 'revenuePerBox',
    name: '单盒子日收入',
    value: 31.3,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.05,
    momRate: 0.05,
    yoyRate: 0.08,
    sparkline: [28.5, 29.2, 29.8, 30.1, 30.6, 31.0, 31.3],
    definition: '总收入 / 有效盒子数 / 统计天数',
    linkedDimension: '设备效率',
    linkedPath: '/device-efficiency',
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
  periodKey: string;
  target: number;
  actual: number;
  rate: number;
  prevActual: number;
  prevRate: number;
}

export const targetAchievementData: TargetAchievement[] = [
  { period: '今日', periodKey: 'today', target: 50000, actual: 47843, rate: 0.957, prevActual: 46200, prevRate: 0.924 },
  { period: '昨天', periodKey: 'yesterday', target: 50000, actual: 46200, rate: 0.924, prevActual: 48100, prevRate: 0.962 },
  { period: '本周', periodKey: 'thisWeek', target: 350000, actual: 328500, rate: 0.939, prevActual: 315000, prevRate: 0.900 },
  { period: '上周', periodKey: 'lastWeek', target: 350000, actual: 341200, rate: 0.975, prevActual: 330000, prevRate: 0.943 },
  { period: '本月', periodKey: 'thisMonth', target: 1500000, actual: 1435280, rate: 0.957, prevActual: 1380000, prevRate: 0.920 },
  { period: '上月', periodKey: 'lastMonth', target: 1500000, actual: 1482000, rate: 0.988, prevActual: 1410000, prevRate: 0.940 },
];

// ============ 目标达成趋势数据（近30天日维度） ============
export interface TargetTrendPoint {
  date: string;
  actual: number;
  target: number;
  predicted?: number;
}

function generateTargetTrend(): TargetTrendPoint[] {
  const data: TargetTrendPoint[] = [];
  const baseDate = new Date('2026-02-10');
  const dailyTarget = 50000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const factor = isWeekend ? 1.2 + Math.random() * 0.15 : 0.85 + Math.random() * 0.25;
    const actual = Math.round(dailyTarget * factor);
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      actual,
      target: dailyTarget,
    });
  }

  // Add 7 days of predicted data
  const lastDate = new Date('2026-03-12');
  const recentAvg = data.slice(-7).reduce((s, d) => s + d.actual, 0) / 7;
  for (let i = 0; i < 7; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const factor = isWeekend ? 1.15 : 0.95;
    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      actual: 0,
      target: dailyTarget,
      predicted: Math.round(recentAvg * factor),
    });
  }

  return data;
}

export const targetTrendData: TargetTrendPoint[] = generateTargetTrend();

// ============ 月度累计趋势（用于预测模块） ============
export interface MonthCumulativePoint {
  day: number;
  cumActual: number;
  cumTarget: number;
  cumPredicted?: number;
}

function generateMonthCumulative(): MonthCumulativePoint[] {
  const data: MonthCumulativePoint[] = [];
  const dailyTarget = 50000;
  let cumActual = 0;
  let cumTarget = 0;
  const today = 11; // March 11

  for (let d = 1; d <= 31; d++) {
    cumTarget += dailyTarget;
    if (d <= today) {
      const factor = 0.85 + Math.random() * 0.3;
      cumActual += Math.round(dailyTarget * factor);
      data.push({ day: d, cumActual, cumTarget });
    } else {
      // Predicted: average of actual daily so far
      const avgDaily = cumActual / today;
      const projectedCum = cumActual + avgDaily * (d - today);
      data.push({ day: d, cumActual: 0, cumTarget, cumPredicted: Math.round(projectedCum) });
    }
  }
  return data;
}

export const monthCumulativeData: MonthCumulativePoint[] = generateMonthCumulative();
