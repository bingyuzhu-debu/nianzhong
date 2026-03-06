import { useState } from 'react';
import { Checkbox, Space } from 'antd';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { RevenueTrendPoint } from '../../types';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface Props {
  data: RevenueTrendPoint[];
}

export default function RevenueTrendChart({ data }: Props) {
  const [showUV, setShowUV] = useState(false);
  const [showPaying, setShowPaying] = useState(false);

  const series: echarts.EChartsCoreOption['series'] = [
    {
      name: '总收入',
      type: 'line',
      data: data.map(d => d.revenue),
      smooth: true,
      symbol: 'circle',
      symbolSize: 4,
      showSymbol: false,
      lineStyle: { width: 2.5, color: '#3182CE' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(49,130,206,0.15)' },
          { offset: 1, color: 'rgba(49,130,206,0.02)' },
        ]),
      },
      itemStyle: { color: '#3182CE' },
    },
  ];

  const yAxes: echarts.EChartsCoreOption['yAxis'] = [
    {
      type: 'value',
      name: '收入(元)',
      axisLabel: { formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : v.toString() },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
  ];

  if (showUV || showPaying) {
    (yAxes as object[]).push({
      type: 'value',
      name: '人数',
      axisLabel: { formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : v.toString() },
      splitLine: { show: false },
    });
  }

  if (showUV) {
    (series as object[]).push({
      name: '扫码UV',
      type: 'line',
      yAxisIndex: 1,
      data: data.map(d => d.uv),
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5, color: '#63B3ED', type: 'dashed' },
      itemStyle: { color: '#63B3ED' },
    });
  }

  if (showPaying) {
    (series as object[]).push({
      name: '付费用户数',
      type: 'line',
      yAxisIndex: 1,
      data: data.map(d => d.payingUsers),
      smooth: true,
      symbol: 'none',
      lineStyle: { width: 1.5, color: '#38A169', type: 'dashed' },
      itemStyle: { color: '#38A169' },
    });
  }

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { show: showUV || showPaying, top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: showUV || showPaying ? 36 : 16, right: showUV || showPaying ? 60 : 20, bottom: 24, left: 55 },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: yAxes,
    series,
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1a202c' }}>收入趋势</span>
        <Space>
          <Checkbox checked={showUV} onChange={(e) => setShowUV(e.target.checked)}>
            <span style={{ fontSize: 12 }}>叠加UV</span>
          </Checkbox>
          <Checkbox checked={showPaying} onChange={(e) => setShowPaying(e.target.checked)}>
            <span style={{ fontSize: 12 }}>叠加付费用户</span>
          </Checkbox>
        </Space>
      </div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 280 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
    </div>
  );
}
