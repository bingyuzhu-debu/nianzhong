import type { KpiData } from '../types';

/* ---------- 盒子类型 ---------- */
export type BoxType = '雷石盒子' | '雷客盒子' | '小程序' | '合作方盒子';
export const BOX_TYPES: BoxType[] = ['雷石盒子', '雷客盒子', '小程序', '合作方盒子'];

/* ---------- 省份数据 ---------- */
export interface ProvinceData {
  name: string;         // 需要与 GeoJSON 中的 properties.name 匹配
  activeBoxes: number;
  totalBoxes: number;
  effectiveRate: number;
  uv: number;
}

/* ---------- 盒子类型构成行 ---------- */
export interface BoxTypeRow {
  type: BoxType;
  activeBoxes: number;
  effectiveRate: number;
  uvPerBox: number;
  ratio: number;
}

/* ---------- 趋势数据点 ---------- */
export interface DeviceTrendPoint {
  date: string;
  activeBoxes: number;
  scanUV: number;
  byType: Record<BoxType, number>;
}

/* ---------- 异常链路节点 ---------- */
export interface AnomalyNode {
  id: string;
  label: string;
  status: 'normal' | 'abnormal' | 'root_cause';
  value?: string;
  children?: AnomalyNode[];
}

/* ---------- KPI 卡片 ---------- */
export const deviceKpiData: KpiData[] = [
  {
    key: 'activeBoxes',
    name: '有效盒子数',
    value: 65832,
    unit: '台',
    format: 'number',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.12,
    momRate: -0.12,
    yoyRate: 0.05,
    sparkline: [72100, 71200, 70500, 69800, 68600, 67200, 65832],
    definition: '统计周期内产生过扫码行为的盒子总数',
    linkedDimension: '设备效率',
    linkedPath: '/device-efficiency',
  },
  {
    key: 'effectiveRate',
    name: '有效率',
    value: 0.723,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'down',
    changeRate: -0.06,
    momRate: -0.06,
    yoyRate: 0.02,
    sparkline: [0.76, 0.755, 0.748, 0.74, 0.735, 0.728, 0.723],
    definition: '有效盒子数 / 已部署盒子总数 × 100%',
    linkedDimension: '设备效率',
    linkedPath: '/device-efficiency',
  },
  {
    key: 'uvPerBox',
    name: '单盒UV',
    value: 128,
    unit: '人',
    format: 'number',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.03,
    momRate: 0.03,
    yoyRate: 0.08,
    sparkline: [118, 120, 122, 124, 125, 126, 128],
    definition: '扫码UV / 有效盒子数',
    linkedDimension: '设备效率',
    linkedPath: '/device-efficiency',
  },
  {
    key: 'onlineRate',
    name: '联网率',
    value: 0.912,
    unit: '',
    format: 'percent',
    polarity: 'positive',
    trend: 'flat',
    changeRate: -0.01,
    momRate: -0.01,
    yoyRate: 0.03,
    sparkline: [0.918, 0.916, 0.915, 0.914, 0.913, 0.912, 0.912],
    definition: '在线盒子数 / 已部署盒子总数 × 100%',
    linkedDimension: '设备效率',
    linkedPath: '/device-efficiency',
  },
  {
    key: 'revenuePerBox',
    name: '单盒收入',
    value: 286,
    unit: '元',
    format: 'currency',
    polarity: 'positive',
    trend: 'up',
    changeRate: 0.07,
    momRate: 0.07,
    yoyRate: 0.15,
    sparkline: [252, 258, 265, 272, 278, 282, 286],
    definition: '总收入 / 有效盒子数',
    linkedDimension: '设备效率',
    linkedPath: '/device-efficiency',
  },
];

/* ---------- 趋势数据 ---------- */
function generateTrendData(): DeviceTrendPoint[] {
  const data: DeviceTrendPoint[] = [];
  const baseDate = new Date('2026-02-04');
  let total = 72500;
  let uv = 9200000;

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 有效盒子数缓慢下降（模拟异常期间）
    const boxDelta = i > 15 ? -0.008 : -0.002;
    total = Math.round(total * (1 + boxDelta + (Math.random() - 0.5) * 0.004));

    const uvFactor = isWeekend ? 1.25 : 0.92;
    uv = Math.round(uv * (0.99 + Math.random() * 0.03) * uvFactor / (isWeekend ? 1.2 : 0.95));

    const leishi = Math.round(total * (0.39 + Math.random() * 0.02));
    const leike = Math.round(total * (0.28 + Math.random() * 0.02));
    // 雷客盒子在后半段骤降
    const leikeAdj = i > 20 ? Math.round(leike * 0.82) : leike;
    const miniApp = Math.round(total * (0.19 + Math.random() * 0.02));
    const partner = total - leishi - leikeAdj - miniApp;

    data.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      activeBoxes: total,
      scanUV: uv,
      byType: {
        '雷石盒子': leishi,
        '雷客盒子': leikeAdj,
        '小程序': miniApp,
        '合作方盒子': Math.max(partner, 0),
      },
    });
  }
  return data;
}

export const deviceTrendData: DeviceTrendPoint[] = generateTrendData();

/* ---------- 盒子类型构成 ---------- */
export const boxTypeData: BoxTypeRow[] = [
  { type: '雷石盒子', activeBoxes: 26332, effectiveRate: 0.78, uvPerBox: 142, ratio: 0.40 },
  { type: '雷客盒子', activeBoxes: 18483, effectiveRate: 0.65, uvPerBox: 115, ratio: 0.28 },
  { type: '小程序', activeBoxes: 13166, effectiveRate: 0.82, uvPerBox: 135, ratio: 0.20 },
  { type: '合作方盒子', activeBoxes: 7851, effectiveRate: 0.58, uvPerBox: 98, ratio: 0.12 },
];

/* ---------- 省份数据 ---------- */
export const provinceData: ProvinceData[] = [
  { name: '广东省', activeBoxes: 8520, totalBoxes: 11200, effectiveRate: 0.76, uv: 1120000 },
  { name: '浙江省', activeBoxes: 6280, totalBoxes: 8100, effectiveRate: 0.78, uv: 820000 },
  { name: '江苏省', activeBoxes: 5960, totalBoxes: 7800, effectiveRate: 0.76, uv: 780000 },
  { name: '山东省', activeBoxes: 4820, totalBoxes: 6500, effectiveRate: 0.74, uv: 620000 },
  { name: '四川省', activeBoxes: 4580, totalBoxes: 6200, effectiveRate: 0.74, uv: 590000 },
  { name: '河南省', activeBoxes: 4120, totalBoxes: 5800, effectiveRate: 0.71, uv: 520000 },
  { name: '湖北省', activeBoxes: 3680, totalBoxes: 5100, effectiveRate: 0.72, uv: 480000 },
  { name: '湖南省', activeBoxes: 3520, totalBoxes: 4900, effectiveRate: 0.72, uv: 450000 },
  { name: '河北省', activeBoxes: 3280, totalBoxes: 4600, effectiveRate: 0.71, uv: 420000 },
  { name: '福建省', activeBoxes: 2960, totalBoxes: 3900, effectiveRate: 0.76, uv: 390000 },
  { name: '安徽省', activeBoxes: 2680, totalBoxes: 3800, effectiveRate: 0.71, uv: 340000 },
  { name: '辽宁省', activeBoxes: 2420, totalBoxes: 3400, effectiveRate: 0.71, uv: 310000 },
  { name: '北京市', activeBoxes: 2180, totalBoxes: 2700, effectiveRate: 0.81, uv: 320000 },
  { name: '上海市', activeBoxes: 2050, totalBoxes: 2500, effectiveRate: 0.82, uv: 310000 },
  { name: '陕西省', activeBoxes: 1860, totalBoxes: 2600, effectiveRate: 0.72, uv: 240000 },
  { name: '重庆市', activeBoxes: 1720, totalBoxes: 2400, effectiveRate: 0.72, uv: 220000 },
  { name: '黑龙江省', activeBoxes: 1580, totalBoxes: 2300, effectiveRate: 0.69, uv: 200000 },
  { name: '吉林省', activeBoxes: 1320, totalBoxes: 1900, effectiveRate: 0.69, uv: 170000 },
  { name: '云南省', activeBoxes: 1180, totalBoxes: 1700, effectiveRate: 0.69, uv: 150000 },
  { name: '山西省', activeBoxes: 1050, totalBoxes: 1500, effectiveRate: 0.70, uv: 135000 },
  { name: '广西壮族自治区', activeBoxes: 980, totalBoxes: 1400, effectiveRate: 0.70, uv: 125000 },
  { name: '江西省', activeBoxes: 920, totalBoxes: 1300, effectiveRate: 0.71, uv: 118000 },
  { name: '贵州省', activeBoxes: 680, totalBoxes: 1000, effectiveRate: 0.68, uv: 87000 },
  { name: '天津市', activeBoxes: 650, totalBoxes: 850, effectiveRate: 0.76, uv: 85000 },
  { name: '内蒙古自治区', activeBoxes: 520, totalBoxes: 780, effectiveRate: 0.67, uv: 66000 },
  { name: '新疆维吾尔自治区', activeBoxes: 380, totalBoxes: 600, effectiveRate: 0.63, uv: 48000 },
  { name: '甘肃省', activeBoxes: 320, totalBoxes: 500, effectiveRate: 0.64, uv: 41000 },
  { name: '海南省', activeBoxes: 280, totalBoxes: 380, effectiveRate: 0.74, uv: 42000 },
  { name: '宁夏回族自治区', activeBoxes: 180, totalBoxes: 280, effectiveRate: 0.64, uv: 23000 },
  { name: '青海省', activeBoxes: 120, totalBoxes: 200, effectiveRate: 0.60, uv: 15000 },
  { name: '西藏自治区', activeBoxes: 60, totalBoxes: 120, effectiveRate: 0.50, uv: 7500 },
  { name: '台湾省', activeBoxes: 40, totalBoxes: 80, effectiveRate: 0.50, uv: 5000 },
];

/* ---------- 异常定位链路 ---------- */
export const anomalyTree: AnomalyNode = {
  id: 'revenue',
  label: '收入下降',
  status: 'abnormal',
  value: '环比 -8.5%',
  children: [
    {
      id: 'conversion',
      label: '转化率是否变化？',
      status: 'normal',
      value: '基本不变 (-0.3%)',
      children: [
        {
          id: 'activeBoxes',
          label: '有效盒子数减少',
          status: 'abnormal',
          value: '环比 -12%',
          children: [
            { id: 'leishi', label: '雷石盒子', status: 'normal', value: '-2.1%' },
            { id: 'leike', label: '雷客盒子', status: 'root_cause', value: '-18.5%（批量离线）' },
            { id: 'miniapp', label: '小程序', status: 'normal', value: '-1.2%' },
            { id: 'partner', label: '合作方盒子', status: 'normal', value: '+0.5%' },
          ],
        },
      ],
    },
  ],
};

/* ---------- 省份→城市映射（简化版，用于级联筛选） ---------- */
export const regionCascadeData = [
  {
    value: '全国',
    label: '全国',
    children: [
      {
        value: '广东省', label: '广东省', children: [
          { value: '广州市', label: '广州市' },
          { value: '深圳市', label: '深圳市' },
          { value: '东莞市', label: '东莞市' },
          { value: '佛山市', label: '佛山市' },
        ],
      },
      {
        value: '浙江省', label: '浙江省', children: [
          { value: '杭州市', label: '杭州市' },
          { value: '宁波市', label: '宁波市' },
          { value: '温州市', label: '温州市' },
        ],
      },
      {
        value: '江苏省', label: '江苏省', children: [
          { value: '南京市', label: '南京市' },
          { value: '苏州市', label: '苏州市' },
          { value: '无锡市', label: '无锡市' },
        ],
      },
      {
        value: '四川省', label: '四川省', children: [
          { value: '成都市', label: '成都市' },
          { value: '绵阳市', label: '绵阳市' },
        ],
      },
      {
        value: '山东省', label: '山东省', children: [
          { value: '济南市', label: '济南市' },
          { value: '青岛市', label: '青岛市' },
        ],
      },
      {
        value: '河南省', label: '河南省', children: [
          { value: '郑州市', label: '郑州市' },
          { value: '洛阳市', label: '洛阳市' },
        ],
      },
      {
        value: '湖北省', label: '湖北省', children: [
          { value: '武汉市', label: '武汉市' },
          { value: '宜昌市', label: '宜昌市' },
        ],
      },
      {
        value: '湖南省', label: '湖南省', children: [
          { value: '长沙市', label: '长沙市' },
          { value: '株洲市', label: '株洲市' },
        ],
      },
      {
        value: '北京市', label: '北京市', children: [],
      },
      {
        value: '上海市', label: '上海市', children: [],
      },
    ],
  },
];
