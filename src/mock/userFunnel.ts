import type { KpiData } from '../types';

/* ---------- 漏斗环节 ---------- */
export type FunnelStage = '扫码' | '进入H5' | '点歌' | '浏览商品' | '付费' | '复购';
export const FUNNEL_STAGES: FunnelStage[] = ['扫码', '进入H5', '点歌', '浏览商品', '付费', '复购'];

export type UserType = '全部' | '新用户' | '老用户';

/* ---------- 漏斗节点 ---------- */
export interface FunnelNode {
  stage: FunnelStage;
  count: number;
  rate: number;       // 相对上一环节的转化率（第一环节为 100%）
  changeRate: number;  // 环比变化
}

/* ---------- 停留时长分布 ---------- */
export interface DurationBucket {
  range: string;
  newUsers: number;
  oldUsers: number;
  total: number;
}

/* ---------- 趋势数据点 ---------- */
export interface FunnelTrendPoint {
  date: string;
  scanUV: number;
  payRate: number;
  repurchaseRate: number;
  zeroSongRate: number;
  avgDuration: number;
  avgPageDepth: number;
  newAvgDuration: number;
  oldAvgDuration: number;
}

/* ---------- 零点歌用户画像 ---------- */
export interface ZeroSongProfile {
  newUserRatio: number;
  oldUserRatio: number;
  avgDuration: number;
  exitPages: { page: string; ratio: number }[];
}

/* ---------- 异常链路节点 ---------- */
export interface FunnelAnomalyNode {
  id: string;
  label: string;
  status: 'normal' | 'abnormal' | 'root_cause';
  value?: string;
  children?: FunnelAnomalyNode[];
}

/* ---------- KPI 卡片 ---------- */
export const funnelKpiData: KpiData[] = [
  {
    key: 'scanUV',
    name: '扫码UV',
    value: 682400,
    unit: '人',
    format: 'number',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.05,
    momRate: 0.05,
    yoyRate: 0.12,
    sparkline: [638000, 645000, 652000, 660000, 668000, 675000, 682400],
    definition: '统计周期内扫码进入H5的独立用户数（按user_id去重）',
    linkedDimension: '用户漏斗',
    linkedPath: '/user-funnel',
  },
  {
    key: 'payRate',
    name: '付费转化率',
    value: 0.052,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.12,
    momRate: -0.12,
    yoyRate: -0.05,
    sparkline: [0.058, 0.057, 0.056, 0.055, 0.054, 0.053, 0.052],
    definition: '付费用户数 / 扫码UV x 100%',
    linkedDimension: '用户漏斗',
    linkedPath: '/user-funnel',
  },
  {
    key: 'repurchaseRate',
    name: '复购率',
    value: 0.185,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.03,
    momRate: 0.03,
    yoyRate: 0.08,
    sparkline: [0.172, 0.175, 0.178, 0.180, 0.182, 0.184, 0.185],
    definition: '二次及以上付费用户数 / 历史付费用户数 x 100%',
    linkedDimension: '用户漏斗',
    linkedPath: '/user-funnel',
  },
  {
    key: 'zeroSongRate',
    name: '零点歌率',
    value: 0.352,
    unit: '',
    format: 'percent',
    polarity: 'negative',
    trend: 'up',
    changeRate: 0.22,
    momRate: 0.22,
    yoyRate: 0.10,
    sparkline: [0.280, 0.295, 0.310, 0.320, 0.335, 0.345, 0.352],
    definition: '进入H5但未点歌的用户数 / 进入H5用户数 x 100%',
    linkedDimension: '用户漏斗',
    linkedPath: '/user-funnel',
  },
  {
    key: 'avgDuration',
    name: '平均停留时长',
    value: 62,
    unit: '秒',
    format: 'number',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.08,
    momRate: -0.08,
    yoyRate: -0.03,
    sparkline: [68, 67, 66, 65, 64, 63, 62],
    definition: '用户在H5页面的平均停留时间（秒）',
    linkedDimension: '用户漏斗',
    linkedPath: '/user-funnel',
  },
];

/* ---------- 核心漏斗数据 ---------- */
export const funnelDataAll: FunnelNode[] = [
  { stage: '扫码', count: 682400, rate: 1.0, changeRate: 0.05 },
  { stage: '进入H5', count: 614160, rate: 0.90, changeRate: 0.03 },
  { stage: '点歌', count: 398204, rate: 0.648, changeRate: -0.05 },
  { stage: '浏览商品', count: 202686, rate: 0.509, changeRate: -0.02 },
  { stage: '付费', count: 35485, rate: 0.175, changeRate: -0.12 },
  { stage: '复购', count: 6565, rate: 0.185, changeRate: 0.03 },
];

/* ---------- 新用户漏斗 ---------- */
export const funnelDataNew: FunnelNode[] = [
  { stage: '扫码', count: 259312, rate: 1.0, changeRate: 0.08 },
  { stage: '进入H5', count: 225598, rate: 0.87, changeRate: 0.04 },
  { stage: '点歌', count: 131097, rate: 0.581, changeRate: -0.10 },
  { stage: '浏览商品', count: 59296, rate: 0.452, changeRate: -0.06 },
  { stage: '付费', count: 8039, rate: 0.136, changeRate: -0.18 },
  { stage: '复购', count: 804, rate: 0.100, changeRate: -0.05 },
];

/* ---------- 老用户漏斗 ---------- */
export const funnelDataOld: FunnelNode[] = [
  { stage: '扫码', count: 423088, rate: 1.0, changeRate: 0.03 },
  { stage: '进入H5', count: 388562, rate: 0.918, changeRate: 0.02 },
  { stage: '点歌', count: 267107, rate: 0.688, changeRate: -0.02 },
  { stage: '浏览商品', count: 143390, rate: 0.537, changeRate: 0.01 },
  { stage: '付费', count: 27446, rate: 0.191, changeRate: -0.08 },
  { stage: '复购', count: 5761, rate: 0.210, changeRate: 0.05 },
];

/* ---------- 停留时长分布 ---------- */
export const durationDistribution: DurationBucket[] = [
  { range: '0-10s', newUsers: 38200, oldUsers: 22100, total: 60300 },
  { range: '10-30s', newUsers: 72500, oldUsers: 85200, total: 157700 },
  { range: '30-60s', newUsers: 88400, oldUsers: 142800, total: 231200 },
  { range: '60s+', newUsers: 60212, oldUsers: 138748, total: 198960 },
];

/* ---------- 趋势数据 ---------- */
function generateFunnelTrend(): FunnelTrendPoint[] {
  const data: FunnelTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');

  let scanUV = 640000;
  let payRate = 0.058;
  let repRate = 0.175;
  let zeroRate = 0.280;
  let avgDur = 68;
  let pageDepth = 4.2;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const uvFactor = isWeekend ? 1.2 : 0.95;
    scanUV = Math.round(scanUV * (0.99 + Math.random() * 0.03) * uvFactor / (isWeekend ? 1.15 : 0.97));

    // 付费转化率在第 18 天后明显下滑（模拟异常）
    const payDelta = i > 18 ? -0.0008 : -0.0002;
    payRate = Math.max(0.04, payRate + payDelta + (Math.random() - 0.5) * 0.001);

    repRate = Math.min(0.22, repRate + 0.0003 + (Math.random() - 0.5) * 0.002);

    // 零点歌率在第 15 天后上升（模拟异常）
    const zeroDelta = i > 15 ? 0.003 : 0.001;
    zeroRate = Math.min(0.40, zeroRate + zeroDelta + (Math.random() - 0.5) * 0.003);

    avgDur = Math.max(55, avgDur - 0.2 + (Math.random() - 0.5) * 1.5);
    pageDepth = Math.max(3.0, pageDepth - 0.02 + (Math.random() - 0.5) * 0.15);

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      scanUV: Math.round(scanUV),
      payRate: Math.round(payRate * 10000) / 10000,
      repurchaseRate: Math.round(repRate * 1000) / 1000,
      zeroSongRate: Math.round(zeroRate * 1000) / 1000,
      avgDuration: Math.round(avgDur * 10) / 10,
      avgPageDepth: Math.round(pageDepth * 10) / 10,
      newAvgDuration: Math.round((avgDur * 0.72) * 10) / 10,
      oldAvgDuration: Math.round((avgDur * 1.18) * 10) / 10,
    });
  }
  return data;
}

export const funnelTrendData: FunnelTrendPoint[] = generateFunnelTrend();

/* ---------- 零点歌用户画像 ---------- */
export const zeroSongProfile: ZeroSongProfile = {
  newUserRatio: 0.62,
  oldUserRatio: 0.38,
  avgDuration: 18.5,
  exitPages: [
    { page: '首页', ratio: 0.42 },
    { page: '点歌页', ratio: 0.28 },
    { page: '商品页', ratio: 0.15 },
    { page: '个人中心', ratio: 0.10 },
    { page: '其他', ratio: 0.05 },
  ],
};

/* ---------- 异常定位链路 ---------- */
export const funnelAnomalyTree: FunnelAnomalyNode = {
  id: 'payRateDown',
  label: '付费转化率下降',
  status: 'abnormal',
  value: '环比 -12%',
  children: [
    {
      id: 'newUserDown',
      label: '新用户转化率下降',
      status: 'abnormal',
      value: '环比 -18%',
      children: [
        {
          id: 'songRateDown',
          label: '点歌率下降',
          status: 'root_cause',
          value: '-10%（页面加载慢/引导不足）',
        },
        {
          id: 'browseDown',
          label: '浏览商品率下降',
          status: 'abnormal',
          value: '-6%（商品曝光位不够）',
        },
      ],
    },
    {
      id: 'oldUserDown',
      label: '老用户转化率下降',
      status: 'abnormal',
      value: '环比 -8%',
      children: [
        {
          id: 'durationDown',
          label: '停留时长缩短',
          status: 'normal',
          value: '-3%',
        },
        {
          id: 'noBrowse',
          label: '不浏览商品',
          status: 'normal',
          value: '变化不大',
        },
        {
          id: 'zeroSongUp',
          label: '零点歌率上升',
          status: 'abnormal',
          value: '+22%（体验问题导致离开）',
        },
      ],
    },
  ],
};

// ============ 点歌数量分布 ============
export interface SongCountBucket {
  range: string;
  count: number;
  ratio: number;
}

export const songCountDistribution: SongCountBucket[] = [
  { range: '0首', count: 451598, ratio: 0.352 },
  { range: '1-3首', count: 307896, ratio: 0.240 },
  { range: '4-6首', count: 217574, ratio: 0.170 },
  { range: '7-10首', count: 166920, ratio: 0.130 },
  { range: '10+首', count: 139412, ratio: 0.108 },
];

// ============ 点歌入口 Top10 ============
export interface SongEntrySource {
  entry: string;
  count: number;
  ratio: number;
  changeRate: number;
}

export const songEntryTop10: SongEntrySource[] = [
  { entry: '搜索结果页', count: 523400, ratio: 0.412, changeRate: 0.03 },
  { entry: '推荐歌单', count: 228500, ratio: 0.180, changeRate: 0.08 },
  { entry: '排行榜', count: 165200, ratio: 0.130, changeRate: -0.02 },
  { entry: '歌手页', count: 114100, ratio: 0.090, changeRate: 0.01 },
  { entry: '最近播放', count: 88900, ratio: 0.070, changeRate: -0.05 },
  { entry: '扫码直达', count: 63500, ratio: 0.050, changeRate: 0.12 },
  { entry: '分类浏览', count: 38100, ratio: 0.030, changeRate: -0.03 },
  { entry: '好友推荐', count: 19050, ratio: 0.015, changeRate: 0.25 },
  { entry: 'AI推荐', count: 12700, ratio: 0.010, changeRate: 0.45 },
  { entry: '其他', count: 16350, ratio: 0.013, changeRate: -0.01 },
];
