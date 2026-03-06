import { Tooltip } from 'antd';
import { QuestionCircleOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { KpiData } from '../../types';
import { formatKpiValue, formatRate } from '../../utils/format';
import { getTrendColor } from '../../utils/theme';
import styles from './index.module.css';

echarts.use([LineChart, GridComponent, CanvasRenderer]);

interface KpiCardProps {
  data: KpiData;
  showCompare?: boolean;
}

export default function KpiCard({ data, showCompare = false }: KpiCardProps) {
  const navigate = useNavigate();
  const trendColor = getTrendColor(data.trend, data.polarity, data.changeRate);

  const TrendIcon = data.trend === 'up' ? ArrowUpOutlined
    : data.trend === 'down' ? ArrowDownOutlined
    : MinusOutlined;

  const sparklineOption = {
    grid: { top: 2, right: 0, bottom: 2, left: 0 },
    xAxis: { type: 'category' as const, show: false, data: data.sparkline.map((_, i) => i) },
    yAxis: { type: 'value' as const, show: false, min: Math.min(...data.sparkline) * 0.95 },
    series: [{
      type: 'line' as const,
      data: data.sparkline,
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5, color: trendColor },
      areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: trendColor + '30' },
        { offset: 1, color: trendColor + '05' },
      ])},
    }],
  };

  return (
    <div className={styles.card} onClick={() => navigate(data.linkedPath)}>
      <div className={styles.header}>
        <span className={styles.name}>{data.name}</span>
        <Tooltip title={data.definition} placement="topRight">
          <QuestionCircleOutlined className={styles.helpIcon} onClick={(e) => e.stopPropagation()} />
        </Tooltip>
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{formatKpiValue(data.value, data.format)}</span>
        <span className={styles.trend} style={{ color: trendColor }}>
          <TrendIcon style={{ fontSize: 11, marginRight: 2 }} />
          {formatRate(Math.abs(data.changeRate))}
        </span>
      </div>
      {showCompare && (
        <div className={styles.compareRow}>
          <span>环比: <span style={{ color: getTrendColor(data.momRate > 0 ? 'up' : 'down', data.polarity, data.momRate) }}>{formatRate(data.momRate)}</span></span>
          <span>同比: <span style={{ color: getTrendColor(data.yoyRate > 0 ? 'up' : 'down', data.polarity, data.yoyRate) }}>{formatRate(data.yoyRate)}</span></span>
        </div>
      )}
      <div className={styles.sparkline}>
        <ReactEChartsCore
          echarts={echarts}
          option={sparklineOption}
          style={{ height: 32, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
        />
      </div>
    </div>
  );
}
