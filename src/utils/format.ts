export function formatNumber(value: number): string {
  if (value >= 1e8) return (value / 1e8).toFixed(2) + '亿';
  if (value >= 1e4) return (value / 1e4).toFixed(1) + '万';
  return value.toLocaleString('zh-CN');
}

export function formatPercent(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

export function formatCurrency(value: number): string {
  if (value >= 1e8) return '¥' + (value / 1e8).toFixed(2) + '亿';
  if (value >= 1e4) return '¥' + (value / 1e4).toFixed(1) + '万';
  return '¥' + value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatRate(value: number): string {
  const sign = value > 0 ? '+' : '';
  return sign + (value * 100).toFixed(1) + '%';
}

export function formatKpiValue(value: number, format: 'number' | 'percent' | 'currency'): string {
  switch (format) {
    case 'percent': return formatPercent(value);
    case 'currency': return formatCurrency(value);
    default: return formatNumber(value);
  }
}
