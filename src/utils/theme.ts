import type { Polarity, TrendDirection } from '../types';

const CHANGE_THRESHOLD = 0.05;

export function getTrendColor(
  direction: TrendDirection,
  polarity: Polarity,
  changeRate: number
): string {
  if (Math.abs(changeRate) < CHANGE_THRESHOLD) return '#A0AEC0';

  if (polarity === 'neutral') return '#3182CE';

  const isPositiveChange =
    (polarity === 'positive' && direction === 'up') ||
    (polarity === 'negative' && direction === 'down');

  return isPositiveChange ? '#38A169' : '#E53E3E';
}

export function getAlertColor(level: 'critical' | 'warning' | 'normal'): string {
  switch (level) {
    case 'critical': return '#E53E3E';
    case 'warning': return '#DD6B20';
    case 'normal': return '#38A169';
  }
}

export function getAlertIcon(level: 'critical' | 'warning' | 'normal'): string {
  switch (level) {
    case 'critical': return '🔴';
    case 'warning': return '🟡';
    case 'normal': return '🟢';
  }
}
