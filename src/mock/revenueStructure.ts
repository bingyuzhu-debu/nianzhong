import type { KpiData } from '../types';

/* ========== 类型定义 ========== */

export type RevenueUserType = '全部' | '新用户' | '老用户';
export type PackageCategory = '全部' | 'VIP会员' | '单项服务';
export type PaymentChannel = '全部' | '扫码支付' | '微信H5' | '小程序' | 'APP内购' | '公众号';

export interface RevenueTrendPoint {
  date: string;
  vipRevenue: number;
  serviceRevenue: number;
  totalRevenue: number;
}

export interface PackageRow {
  name: string;
  category: 'VIP会员' | '单项服务';
  sales: number;
  revenue: number;
  share: number;
  momChange: number;
}

export interface UnitPriceTrendPoint {
  date: string;
  overall: number;
  newUser: number;
  oldUser: number;
}

export interface ScatterPoint {
  unitPrice: number;
  frequency: number;
  userCount: number;
}

export interface PaymentChannelRow {
  channel: string;
  uv: number;
  conversionRate: number;
  revenue: number;
  share: number;
}

export interface RefundTrendPoint {
  date: string;
  refundRate: number;
  refundAmount: number;
}

export interface RefundReasonRow {
  reason: string;
  count: number;
  share: number;
}

export interface RefundPackageRow {
  packageName: string;
  count: number;
  amount: number;
  share: number;
}

export interface RevenueAnomalyNode {
  id: string;
  label: string;
  status: 'normal' | 'abnormal' | 'root_cause';
  value?: string;
  children?: RevenueAnomalyNode[];
}

/* ========== KPI 卡片 ========== */

export const revenueKpiData: KpiData[] = [
  {
    key: 'totalRevenue',
    name: '总收入',
    value: 1856000,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.06,
    momRate: 0.06,
    yoyRate: 0.15,
    sparkline: [1720000, 1745000, 1768000, 1790000, 1810000, 1835000, 1856000],
    definition: '统计周期内所有付费订单金额之和（扣除退款）',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
  {
    key: 'unitPrice',
    name: '客单价',
    value: 38.5,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.08,
    momRate: -0.08,
    yoyRate: -0.03,
    sparkline: [42.1, 41.5, 40.8, 40.2, 39.5, 39.0, 38.5],
    definition: '总收入 / 付费用户数',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
  {
    key: 'vipShare',
    name: 'VIP收入占比',
    value: 0.742,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.03,
    momRate: -0.03,
    yoyRate: -0.05,
    sparkline: [0.765, 0.760, 0.755, 0.752, 0.748, 0.745, 0.742],
    definition: 'VIP会员收入 / 总收入 × 100%',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
  {
    key: 'refundRate',
    name: '退款率',
    value: 0.025,
    unit: '',
    format: 'percent',
    polarity: 'negative',
    trend: 'up',
    changeRate: 0.18,
    momRate: 0.18,
    yoyRate: 0.05,
    sparkline: [0.020, 0.021, 0.021, 0.022, 0.023, 0.024, 0.025],
    definition: '退款订单数 / 总订单数 × 100%',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
  {
    key: 'refundAmount',
    name: '退款金额',
    value: 46400,
    unit: '元',
    format: 'currency',
    polarity: 'negative',
    trend: 'up',
    changeRate: 0.22,
    momRate: 0.22,
    yoyRate: 0.08,
    sparkline: [35200, 36800, 38500, 40200, 42100, 44300, 46400],
    definition: '统计周期内退款总金额',
    linkedDimension: '营收结构',
    linkedPath: '/revenue-structure',
  },
];

/* ========== 模块A：收入来源拆解 ========== */

function generateRevenueTrend(): RevenueTrendPoint[] {
  const data: RevenueTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');
  let vip = 45000;
  let svc = 16000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const factor = isWeekend ? 1.35 : 0.92;

    vip = Math.round(vip * (0.98 + Math.random() * 0.06) * factor / (isWeekend ? 1.15 : 0.95));
    svc = Math.round(svc * (0.97 + Math.random() * 0.07) * factor / (isWeekend ? 1.15 : 0.95));

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      vipRevenue: vip,
      serviceRevenue: svc,
      totalRevenue: vip + svc,
    });
  }
  return data;
}

export const revenueTrendData: RevenueTrendPoint[] = generateRevenueTrend();

export const revenueSourcePie = [
  { name: 'VIP会员', value: 1377000 },
  { name: '照片上屏', value: 186000 },
  { name: '特效礼物', value: 158000 },
  { name: '其他增值服务', value: 135000 },
];

/* ========== 模块B：套餐结构分析 ========== */

function generatePackageTrend(): { dates: string[]; series: Record<string, number[]> } {
  const dates: string[] = [];
  const series: Record<string, number[]> = {
    '1天包': [], '7天包': [], '30天包': [], '90天包': [], '365天包': [],
    '照片上屏': [], '特效礼物': [], '其他增值服务': [],
  };

  const baseDate = new Date('2026-02-04');
  const baseShares: Record<string, number> = {
    '1天包': 0.22, '7天包': 0.18, '30天包': 0.25, '90天包': 0.12, '365天包': 0.08,
    '照片上屏': 0.06, '特效礼物': 0.05, '其他增值服务': 0.04,
  };

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`);

    // 模拟1天包占比在第15天后上升（异常信号）
    const dayPackBoost = i > 15 ? 0.03 + (i - 15) * 0.002 : 0;

    for (const key of Object.keys(series)) {
      let share = baseShares[key] + (Math.random() - 0.5) * 0.02;
      if (key === '1天包') share += dayPackBoost;
      if (key === '30天包') share -= dayPackBoost * 0.6;
      series[key].push(Math.max(0.01, Math.round(share * 1000) / 1000));
    }
  }
  return { dates, series };
}

export const packageTrendData = generatePackageTrend();

export const packageTableData: PackageRow[] = [
  { name: '1天包', category: 'VIP会员', sales: 12800, revenue: 384000, share: 0.207, momChange: 0.15 },
  { name: '7天包', category: 'VIP会员', sales: 8500, revenue: 340000, share: 0.183, momChange: 0.02 },
  { name: '30天包', category: 'VIP会员', sales: 5200, revenue: 416000, share: 0.224, momChange: -0.06 },
  { name: '90天包', category: 'VIP会员', sales: 1200, revenue: 168000, share: 0.091, momChange: -0.04 },
  { name: '365天包', category: 'VIP会员', sales: 230, revenue: 69000, share: 0.037, momChange: -0.08 },
  { name: '照片上屏', category: '单项服务', sales: 18600, revenue: 186000, share: 0.100, momChange: 0.12 },
  { name: '特效礼物', category: '单项服务', sales: 15800, revenue: 158000, share: 0.085, momChange: 0.08 },
  { name: '其他增值服务', category: '单项服务', sales: 13500, revenue: 135000, share: 0.072, momChange: 0.03 },
];

/* ========== 模块C：客单价分析 ========== */

function generateUnitPriceTrend(): UnitPriceTrendPoint[] {
  const data: UnitPriceTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');
  let overall = 42.1;
  let newU = 28.5;
  let oldU = 52.3;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // 客单价下降趋势，第15天后加速（对应1天包占比↑）
    const dropRate = i > 15 ? -0.25 : -0.08;
    overall = Math.max(30, overall + dropRate + (Math.random() - 0.5) * 0.8);
    newU = Math.max(20, newU + dropRate * 0.8 + (Math.random() - 0.5) * 0.6);
    oldU = Math.max(40, oldU + dropRate * 0.5 + (Math.random() - 0.5) * 0.5);

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      overall: Math.round(overall * 10) / 10,
      newUser: Math.round(newU * 10) / 10,
      oldUser: Math.round(oldU * 10) / 10,
    });
  }
  return data;
}

export const unitPriceTrendData: UnitPriceTrendPoint[] = generateUnitPriceTrend();

export const scatterData: ScatterPoint[] = [
  { unitPrice: 15, frequency: 1, userCount: 8200 },
  { unitPrice: 22, frequency: 1, userCount: 6500 },
  { unitPrice: 30, frequency: 2, userCount: 5800 },
  { unitPrice: 35, frequency: 2, userCount: 4200 },
  { unitPrice: 38, frequency: 3, userCount: 3600 },
  { unitPrice: 42, frequency: 3, userCount: 2800 },
  { unitPrice: 45, frequency: 4, userCount: 2100 },
  { unitPrice: 50, frequency: 5, userCount: 1500 },
  { unitPrice: 58, frequency: 6, userCount: 980 },
  { unitPrice: 65, frequency: 8, userCount: 650 },
  { unitPrice: 80, frequency: 10, userCount: 420 },
  { unitPrice: 95, frequency: 12, userCount: 280 },
  { unitPrice: 120, frequency: 15, userCount: 150 },
  { unitPrice: 150, frequency: 20, userCount: 85 },
  { unitPrice: 200, frequency: 25, userCount: 45 },
];

/* ========== 模块D：支付入口效率 ========== */

export const paymentChannelData: PaymentChannelRow[] = [
  { channel: '扫码支付', uv: 245000, conversionRate: 0.068, revenue: 856000, share: 0.461 },
  { channel: '微信H5', uv: 186000, conversionRate: 0.052, revenue: 482000, share: 0.260 },
  { channel: '小程序', uv: 98000, conversionRate: 0.045, revenue: 268000, share: 0.144 },
  { channel: 'APP内购', uv: 42000, conversionRate: 0.072, revenue: 168000, share: 0.091 },
  { channel: '公众号', uv: 35000, conversionRate: 0.038, revenue: 82000, share: 0.044 },
];

/* ========== 模块E：退款分析 ========== */

function generateRefundTrend(): RefundTrendPoint[] {
  const data: RefundTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');
  let rate = 0.020;
  let amount = 1100;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);

    // 退款率在第20天后上升
    const rateInc = i > 20 ? 0.0004 : 0.0001;
    rate = Math.min(0.04, rate + rateInc + (Math.random() - 0.5) * 0.0005);
    amount = Math.round(rate * 62000 * (0.9 + Math.random() * 0.2));

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      refundRate: Math.round(rate * 10000) / 10000,
      refundAmount: amount,
    });
  }
  return data;
}

export const refundTrendData: RefundTrendPoint[] = generateRefundTrend();

export const refundReasonData: RefundReasonRow[] = [
  { reason: '误操作购买', count: 520, share: 0.35 },
  { reason: '服务不满意', count: 380, share: 0.26 },
  { reason: '重复购买', count: 245, share: 0.17 },
  { reason: '设备故障', count: 185, share: 0.12 },
  { reason: '其他', count: 150, share: 0.10 },
];

export const refundPackageData: RefundPackageRow[] = [
  { packageName: '1天包', count: 680, amount: 20400, share: 0.44 },
  { packageName: '7天包', count: 320, amount: 12800, share: 0.28 },
  { packageName: '30天包', count: 180, amount: 14400, share: 0.15 },
  { packageName: '照片上屏', count: 150, amount: 4500, share: 0.07 },
  { packageName: '其他', count: 90, amount: 3300, share: 0.06 },
];

/* ========== 模块F：异常定位链路 ========== */

export const revenueAnomalyTree: RevenueAnomalyNode = {
  id: 'unitPriceDown',
  label: '客单价下降',
  status: 'abnormal',
  value: '环比 -8%（¥42.1→¥38.5）',
  children: [
    {
      id: 'packageStructure',
      label: '套餐结构变化',
      status: 'abnormal',
      value: '1天包占比 ↑5pp',
      children: [
        {
          id: 'newUserLowPrice',
          label: '新用户选择低价套餐',
          status: 'root_cause',
          value: '新用户1天包购买量 ↑25%',
        },
        {
          id: 'oldUserDowngrade',
          label: '老用户降档',
          status: 'abnormal',
          value: '30天包→7天包迁移率 12%',
          children: [
            {
              id: 'promoEffect',
              label: '近期促销活动影响',
              status: 'root_cause',
              value: '3月促销频次 ↑，7天包折扣 30%',
            },
          ],
        },
      ],
    },
    {
      id: 'userStructure',
      label: '用户结构变化',
      status: 'normal',
      value: '新用户占比 +2pp（变化不大）',
      children: [
        {
          id: 'newUserShare',
          label: '新用户占比小幅上升',
          status: 'normal',
          value: '38%→40%，影响有限',
        },
      ],
    },
  ],
};

/* ========== 支付入口列表 ========== */

export const PAYMENT_CHANNELS: PaymentChannel[] = ['全部', '扫码支付', '微信H5', '小程序', 'APP内购', '公众号'];
