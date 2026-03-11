import type { KpiData } from '../types';

/* ---------- 广告位分类 ---------- */
export type AdPathGroup = '扫码页' | 'H5首页' | '点歌页' | '商品页' | '支付结果页' | '其他';

export interface AdPlacement {
  id: string;
  name: string;
  group: AdPathGroup;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;         // clicks / impressions
  cvr: number;         // conversions / clicks
  prevRevenue: number;  // 上周期收入
}

export interface VipTrendPoint {
  date: string;
  vipDailyAd: number;
  nonVipDailyAd: number;
}

export interface VipRenewalPoint {
  month: string;
  avgAdExposure: number;
  renewalRate: number;
}

export interface AdAnomalyNode {
  id: string;
  label: string;
  status: 'normal' | 'abnormal' | 'root_cause';
  value?: string;
  children?: AdAnomalyNode[];
}

/* ---------- 26 个广告位定义 ---------- */
const AD_DEFS: { name: string; group: AdPathGroup }[] = [
  // 扫码页 (3)
  { name: '扫码页-顶部Banner', group: '扫码页' },
  { name: '扫码页-底部推荐', group: '扫码页' },
  { name: '扫码页-加载等待', group: '扫码页' },
  // H5首页 (5)
  { name: 'H5首页-轮播Banner', group: 'H5首页' },
  { name: 'H5首页-浮窗广告', group: 'H5首页' },
  { name: 'H5首页-弹窗广告', group: 'H5首页' },
  { name: 'H5首页-信息流第1位', group: 'H5首页' },
  { name: 'H5首页-信息流第3位', group: 'H5首页' },
  // 点歌页 (6)
  { name: '已点列表-顶部推荐', group: '点歌页' },
  { name: '已点列表-底部横幅', group: '点歌页' },
  { name: '未点列表-侧边推荐', group: '点歌页' },
  { name: '未点列表-插入广告', group: '点歌页' },
  { name: '搜索结果-顶部推广', group: '点歌页' },
  { name: '搜索结果-底部横幅', group: '点歌页' },
  // 商品页 (5)
  { name: '会员推荐-首屏Banner', group: '商品页' },
  { name: '会员推荐-对比表上方', group: '商品页' },
  { name: '套餐对比-侧边推荐', group: '商品页' },
  { name: '套餐对比-底部引导', group: '商品页' },
  { name: '商品详情-关联推荐', group: '商品页' },
  // 支付结果页 (4)
  { name: '支付成功-推荐位', group: '支付结果页' },
  { name: '支付成功-底部Banner', group: '支付结果页' },
  { name: '支付失败-引导重试', group: '支付结果页' },
  { name: '支付失败-替代推荐', group: '支付结果页' },
  // 其他 (3)
  { name: '个人中心-Banner', group: '其他' },
  { name: '分享页-底部推荐', group: '其他' },
  { name: '退出挽留弹窗', group: '其他' },
];

/* ---------- 生成 26 个广告位数据 ---------- */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function generatePlacements(): AdPlacement[] {
  const rand = seededRandom(42);

  // 每个广告位的基础曝光量（百万级总和）
  const baseImpressions = [
    // 扫码页: 高曝光
    320000, 280000, 150000,
    // H5首页: 最高曝光
    420000, 180000, 250000, 310000, 220000,
    // 点歌页: 中等
    160000, 120000, 140000, 95000, 180000, 110000,
    // 商品页: 转化高
    85000, 65000, 70000, 55000, 48000,
    // 支付结果页: 低曝光高转化
    42000, 38000, 25000, 22000,
    // 其他: 低
    60000, 45000, 35000,
  ];

  // 点击率基础值 (3-8%)
  const baseCtr = [
    0.045, 0.038, 0.032,
    0.072, 0.055, 0.068, 0.048, 0.042,
    0.035, 0.030, 0.040, 0.028, 0.058, 0.033,
    0.075, 0.062, 0.055, 0.048, 0.070,
    0.065, 0.052, 0.045, 0.040,
    0.038, 0.032, 0.080,
  ];

  // 转化率基础值 (1-5%)
  const baseCvr = [
    0.018, 0.015, 0.012,
    0.035, 0.028, 0.042, 0.022, 0.020,
    0.015, 0.012, 0.018, 0.010, 0.025, 0.014,
    0.048, 0.042, 0.038, 0.035, 0.045,
    0.040, 0.032, 0.022, 0.018,
    0.015, 0.012, 0.050,
  ];

  return AD_DEFS.map((def, i) => {
    const jitter = 0.9 + rand() * 0.2;
    const impressions = Math.round(baseImpressions[i] * jitter);
    const ctr = baseCtr[i] * (0.9 + rand() * 0.2);
    const clicks = Math.round(impressions * ctr);
    const cvr = baseCvr[i] * (0.85 + rand() * 0.3);
    const conversions = Math.round(clicks * cvr);
    const avgOrderValue = 15 + rand() * 25;
    const revenue = Math.round(conversions * avgOrderValue);
    const prevRevenue = Math.round(revenue * (0.85 + rand() * 0.3));

    return {
      id: `ad-${i + 1}`,
      name: def.name,
      group: def.group,
      impressions,
      clicks,
      conversions,
      revenue,
      ctr,
      cvr,
      prevRevenue,
    };
  });
}

export const adPlacements: AdPlacement[] = generatePlacements();

// 总曝光 ~380万
const totalImpressions = adPlacements.reduce((s, p) => s + p.impressions, 0);
const totalClicks = adPlacements.reduce((s, p) => s + p.clicks, 0);
const totalConversions = adPlacements.reduce((s, p) => s + p.conversions, 0);
const totalRevenue = adPlacements.reduce((s, p) => s + p.revenue, 0);
const avgCtr = totalClicks / totalImpressions;
const avgCvr = totalConversions / totalClicks;
const adUV = 842000;
const arpu = totalRevenue / adUV;

/* ---------- KPI 卡片 ---------- */
export const adKpiData: KpiData[] = [
  {
    key: 'totalImpressions',
    name: '总曝光量',
    value: totalImpressions,
    unit: '次',
    format: 'number',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.06,
    momRate: 0.06,
    yoyRate: 0.18,
    sparkline: [3200000, 3350000, 3420000, 3500000, 3580000, 3650000, totalImpressions],
    definition: '所有广告位的曝光次数之和',
    linkedDimension: '广告位效率',
    linkedPath: '/ad-efficiency',
  },
  {
    key: 'avgCtr',
    name: '平均点击率',
    value: avgCtr,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.08,
    momRate: -0.08,
    yoyRate: -0.03,
    sparkline: [0.058, 0.056, 0.054, 0.052, 0.050, 0.049, avgCtr],
    definition: '总点击数 / 总曝光量 x 100%',
    linkedDimension: '广告位效率',
    linkedPath: '/ad-efficiency',
  },
  {
    key: 'avgCvr',
    name: '平均转化率',
    value: avgCvr,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'flat',
    changeRate: -0.02,
    momRate: -0.02,
    yoyRate: 0.05,
    sparkline: [0.028, 0.027, 0.027, 0.026, 0.026, 0.026, avgCvr],
    definition: '广告带来的付费数 / 总点击数 x 100%',
    linkedDimension: '广告位效率',
    linkedPath: '/ad-efficiency',
  },
  {
    key: 'adRevenue',
    name: '广告收入',
    value: totalRevenue,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.09,
    momRate: -0.09,
    yoyRate: 0.12,
    sparkline: [185000, 180000, 176000, 172000, 168000, 165000, totalRevenue],
    definition: '通过广告位引导产生的收入总额',
    linkedDimension: '广告位效率',
    linkedPath: '/ad-efficiency',
  },
  {
    key: 'arpu',
    name: 'ARPU',
    value: arpu,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.11,
    momRate: -0.11,
    yoyRate: 0.02,
    sparkline: [0.22, 0.21, 0.205, 0.20, 0.195, 0.19, arpu],
    definition: '广告收入 / 广告触达UV',
    linkedDimension: '广告位效率',
    linkedPath: '/ad-efficiency',
  },
];

/* ---------- 广告位分组 ---------- */
export const AD_PATH_GROUPS: AdPathGroup[] = ['扫码页', 'H5首页', '点歌页', '商品页', '支付结果页', '其他'];

export const AD_GROUP_OPTIONS = AD_PATH_GROUPS.map((group) => ({
  label: group,
  options: adPlacements
    .filter((p) => p.group === group)
    .map((p) => ({ label: p.name, value: p.id })),
}));

/* ---------- VIP 打扰趋势数据 ---------- */
function generateVipTrend(): VipTrendPoint[] {
  const data: VipTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');
  let vipBase = 4.2;
  let nonVipBase = 8.5;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    // VIP 曝光逐渐上升（打扰加剧）
    vipBase += 0.03 + (Math.random() - 0.4) * 0.08;
    nonVipBase += (Math.random() - 0.5) * 0.15;

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      vipDailyAd: Math.round(vipBase * 100) / 100,
      nonVipDailyAd: Math.round(nonVipBase * 100) / 100,
    });
  }
  return data;
}

export const vipTrendData: VipTrendPoint[] = generateVipTrend();

/* ---------- VIP 曝光量 vs 续费率 ---------- */
export const vipRenewalData: VipRenewalPoint[] = [
  { month: '2025-09', avgAdExposure: 3.2, renewalRate: 0.78 },
  { month: '2025-10', avgAdExposure: 3.5, renewalRate: 0.76 },
  { month: '2025-11', avgAdExposure: 3.8, renewalRate: 0.74 },
  { month: '2025-12', avgAdExposure: 4.0, renewalRate: 0.72 },
  { month: '2026-01', avgAdExposure: 4.5, renewalRate: 0.68 },
  { month: '2026-02', avgAdExposure: 5.1, renewalRate: 0.65 },
];

/* ---------- 异常定位链路 ---------- */
export const adAnomalyTree: AdAnomalyNode = {
  id: 'arpu',
  label: 'ARPU 下降',
  status: 'abnormal',
  value: '环比 -11%',
  children: [
    {
      id: 'unit-price',
      label: '客单价是否变化？',
      status: 'normal',
      value: '基本不变 (-1.2%)',
    },
    {
      id: 'frequency',
      label: '付费频次是否下降？',
      status: 'abnormal',
      value: '环比 -9.5%',
      children: [
        {
          id: 'which-ad',
          label: '哪个广告位效率下降？',
          status: 'abnormal',
          value: '',
          children: [
            {
              id: 'song-page',
              label: '已点页广告位效率下降',
              status: 'root_cause',
              value: '转化率 -35%，用户停留时间缩短',
            },
            {
              id: 'popup',
              label: 'H5首页弹窗点击率下降',
              status: 'abnormal',
              value: '点击率 -22%，弹窗疲劳',
            },
            {
              id: 'product-ad',
              label: '商品页广告转化率下降',
              status: 'normal',
              value: '-3%，基本稳定',
            },
          ],
        },
      ],
    },
  ],
};

// ============ ARPU 归因分析 ============
export interface ArpuAttribution {
  dimension: string;
  segment: string;
  arpu: number;
  userCount: number;
  revenueContribution: number;
  changeRate: number;
}

export const arpuByStore: ArpuAttribution[] = [
  { dimension: '门店类型', segment: '量贩KTV', arpu: 0.95, userCount: 562000, revenueContribution: 0.42, changeRate: -0.05 },
  { dimension: '门店类型', segment: '雷客', arpu: 1.35, userCount: 385000, revenueContribution: 0.32, changeRate: -0.12 },
  { dimension: '门店类型', segment: '夜总会', arpu: 2.10, userCount: 198000, revenueContribution: 0.18, changeRate: 0.03 },
  { dimension: '门店类型', segment: '酒吧', arpu: 0.78, userCount: 138400, revenueContribution: 0.08, changeRate: -0.08 },
];

export const arpuByRegion: ArpuAttribution[] = [
  { dimension: '区域', segment: '华东', arpu: 1.35, userCount: 410000, revenueContribution: 0.35, changeRate: -0.06 },
  { dimension: '区域', segment: '华南', arpu: 1.28, userCount: 320000, revenueContribution: 0.26, changeRate: -0.03 },
  { dimension: '区域', segment: '华北', arpu: 1.05, userCount: 280000, revenueContribution: 0.19, changeRate: -0.10 },
  { dimension: '区域', segment: '西南', arpu: 0.92, userCount: 150000, revenueContribution: 0.09, changeRate: 0.02 },
  { dimension: '区域', segment: '其他', arpu: 0.85, userCount: 123400, revenueContribution: 0.11, changeRate: -0.04 },
];

export const arpuByDeviceType: ArpuAttribution[] = [
  { dimension: '设备型号', segment: 'V20 Pro', arpu: 1.52, userCount: 285000, revenueContribution: 0.30, changeRate: 0.05 },
  { dimension: '设备型号', segment: 'V20', arpu: 1.18, userCount: 365000, revenueContribution: 0.30, changeRate: -0.08 },
  { dimension: '设备型号', segment: 'V10', arpu: 0.95, userCount: 310000, revenueContribution: 0.20, changeRate: -0.12 },
  { dimension: '设备型号', segment: '其他', arpu: 0.82, userCount: 323400, revenueContribution: 0.20, changeRate: -0.06 },
];
