import { useState } from 'react';
import { Switch, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { RadarDimension } from '../../types';

echarts.use([RadarChart, TooltipComponent, LegendComponent, CanvasRenderer]);

interface Props {
  data: RadarDimension[];
}

export default function HealthRadarChart({ data }: Props) {
  const [showPrev, setShowPrev] = useState(false);
  const navigate = useNavigate();

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: showPrev ? {
      data: ['本期', '上一周期'],
      bottom: 0,
      textStyle: { fontSize: 12 },
    } : undefined,
    radar: {
      indicator: data.map(d => ({ name: d.dimension, max: 100 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#595959', fontSize: 12, fontWeight: 500 },
      splitArea: { areaStyle: { color: ['rgba(49,130,206,0.02)', 'rgba(49,130,206,0.05)'] } },
      splitLine: { lineStyle: { color: '#e8e8e8' } },
      axisLine: { lineStyle: { color: '#d9d9d9' } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          name: '本期',
          value: data.map(d => d.score),
          areaStyle: { color: 'rgba(49,130,206,0.15)' },
          lineStyle: { color: '#3182CE', width: 2 },
          itemStyle: { color: '#3182CE' },
          symbol: 'circle',
          symbolSize: 6,
        },
        ...(showPrev ? [{
          name: '上一周期',
          value: data.map(d => d.prevScore),
          areaStyle: { color: 'rgba(160,174,192,0.1)' },
          lineStyle: { color: '#A0AEC0', width: 1.5, type: 'dashed' as const },
          itemStyle: { color: '#A0AEC0' },
          symbol: 'circle',
          symbolSize: 4,
        }] : []),
      ],
    }],
  };

  const onEvents = {
    click: (params: { name?: string }) => {
      const dim = data.find(d => d.dimension === params.name);
      if (dim) navigate(dim.path);
    },
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a202c' }}>五维度健康度</span>
        <Space size="small">
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>对比上期</span>
          <Switch size="small" checked={showPrev} onChange={setShowPrev} />
        </Space>
      </div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 300 }}
        opts={{ renderer: 'canvas' }}
        onEvents={onEvents}
        notMerge
      />
    </div>
  );
}
