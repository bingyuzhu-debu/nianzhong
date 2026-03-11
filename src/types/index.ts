export type TrendDirection = 'up' | 'down' | 'flat';
export type Polarity = 'positive' | 'negative' | 'neutral';
export type AlertLevel = 'critical' | 'warning' | 'normal';
export type TimeGranularity = 'day' | 'week' | 'month';
export type KtvType = '全部' | '量贩' | '雷客' | '夜总会' | '酒吧';

export interface KpiData {
  key: string;
  name: string;
  value: number;
  unit: string;
  format: 'number' | 'percent' | 'currency';
  polarity: Polarity;
  trend: TrendDirection;
  changeRate: number;
  momRate: number;
  yoyRate: number;
  sparkline: number[];
  definition: string;
  linkedDimension: string;
  linkedPath: string;
}

export interface AlertItem {
  dimension: string;
  level: AlertLevel;
  description: string;
  metric: string;
  changeRate: number;
  path: string;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
  uv: number;
  payingUsers: number;
}

export interface RadarDimension {
  dimension: string;
  score: number;
  prevScore: number;
  path: string;
}

export interface FilterState {
  dateRange: [string, string];
  granularity: TimeGranularity;
  compareMode: boolean;
  ktvType: KtvType;
}
