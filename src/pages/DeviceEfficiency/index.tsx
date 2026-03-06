import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Select, Cascader, Table } from 'antd';
import { InfoCircleOutlined, WarningOutlined, AlertOutlined } from '@ant-design/icons';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart, MapChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GeoComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import KpiCard from '../../components/KpiCard';
import {
  deviceKpiData,
  deviceTrendData,
  boxTypeData,
  provinceData,
  anomalyTree,
  regionCascadeData,
  BOX_TYPES,
} from '../../mock';
import type { BoxType, AnomalyNode } from '../../mock';
import type { FilterState } from '../../types';
import { formatNumber, formatPercent } from '../../utils/format';
import styles from './index.module.css';

echarts.use([
  LineChart, BarChart, MapChart,
  GridComponent, TooltipComponent, LegendComponent,
  VisualMapComponent, GeoComponent,
  CanvasRenderer,
]);

let mapRegistered = false;

export default function DeviceEfficiency() {
  const { filter } = useOutletContext<{ filter: FilterState }>();
  const [boxTypeFilter, setBoxTypeFilter] = useState<string>('全部');
  const [regionFilter, setRegionFilter] = useState<string[]>(['全国']);
  const [mapReady, setMapReady] = useState(mapRegistered);

  // Register China map
  useEffect(() => {
    if (mapRegistered) return;
    fetch('/china.json')
      .then((r) => r.json())
      .then((geoJson) => {
        echarts.registerMap('china', geoJson);
        mapRegistered = true;
        setMapReady(true);
      });
  }, []);

  // Filtered KPI (mock: adjust values based on filter)
  const filteredKpi = useMemo(() => {
    if (boxTypeFilter === '全部') return deviceKpiData;
    const typeIdx = BOX_TYPES.indexOf(boxTypeFilter as BoxType);
    const ratios = [0.40, 0.28, 0.20, 0.12];
    const ratio = ratios[typeIdx] ?? 1;
    return deviceKpiData.map((kpi) => ({
      ...kpi,
      value: kpi.format === 'percent' ? kpi.value : Math.round(kpi.value * ratio),
      sparkline: kpi.sparkline.map((v) =>
        kpi.format === 'percent' ? v : Math.round(v * ratio)
      ),
    }));
  }, [boxTypeFilter]);

  // Filtered province data
  const filteredProvinces = useMemo(() => {
    if (regionFilter.length <= 1 || regionFilter[0] === '全国') return provinceData;
    const prov = regionFilter[1];
    if (prov) return provinceData.filter((p) => p.name === prov);
    return provinceData;
  }, [regionFilter]);

  // Page conclusion
  const activeBoxes = filteredKpi.find((k) => k.key === 'activeBoxes')!;
  const effectiveRate = filteredKpi.find((k) => k.key === 'effectiveRate')!;
  const isAbnormal = activeBoxes.changeRate <= -0.1;

  return (
    <div className={styles.page}>
      {/* 维度专属筛选器 */}
      <div className={styles.localFilter}>
        <span className={styles.filterLabel}>盒子类型</span>
        <Select
          size="small"
          value={boxTypeFilter}
          onChange={setBoxTypeFilter}
          style={{ width: 140 }}
          options={[
            { label: '全部', value: '全部' },
            ...BOX_TYPES.map((t) => ({ label: t, value: t })),
          ]}
        />
        <span className={styles.filterLabel}>地区</span>
        <Cascader
          size="small"
          options={regionCascadeData}
          value={regionFilter}
          onChange={(v) => setRegionFilter((v as string[]) || ['全国'])}
          changeOnSelect
          style={{ width: 200 }}
          placeholder="全国"
        />
      </div>

      {/* 页面结论区 */}
      <div className={styles.conclusion}>
        {isAbnormal ? (
          <AlertOutlined className={styles.conclusionIcon} style={{ color: 'var(--color-danger)' }} />
        ) : (
          <InfoCircleOutlined className={styles.conclusionIcon} style={{ color: 'var(--color-primary)' }} />
        )}
        <span>
          当前有效盒子 <strong>{formatNumber(activeBoxes.value)}</strong> 台，
          有效率 <strong>{formatPercent(effectiveRate.value)}</strong>，
          {isAbnormal
            ? `环比下降 ${Math.abs(activeBoxes.changeRate * 100).toFixed(1)}%，雷客盒子批量离线是主因`
            : `运行正常`}
        </span>
      </div>

      {/* KPI 卡片区 */}
      <div className={styles.kpiGrid}>
        {filteredKpi.map((kpi) => (
          <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
        ))}
      </div>

      {/* 模块A：盒子趋势 */}
      <BoxTrendModule boxTypeFilter={boxTypeFilter} />

      {/* 模块B：盒子类型构成 */}
      <BoxTypeModule onSelectType={setBoxTypeFilter} />

      {/* 模块C：地域分布 */}
      <GeoModule
        provinces={filteredProvinces}
        mapReady={mapReady}
        onSelectProvince={(name) => setRegionFilter(['全国', name])}
      />

      {/* 模块D：异常定位链路 */}
      {isAbnormal && <AnomalyModule />}
    </div>
  );
}

/* ============================================================
   模块 A：盒子趋势
   ============================================================ */
function BoxTrendModule({ boxTypeFilter }: { boxTypeFilter: string }) {
  const data = deviceTrendData;

  const option: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 60, bottom: 24, left: 55 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: [
      {
        type: 'value',
        name: '有效盒子数',
        axisLabel: {
          formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : String(v),
        },
        splitLine: { lineStyle: { color: '#f0f0f0' } },
      },
      {
        type: 'value',
        name: '扫码UV',
        axisLabel: {
          formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(0) + 'w' : String(v),
        },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '有效盒子数',
        type: 'line',
        data: data.map((d) => {
          if (boxTypeFilter !== '全部') {
            return d.byType[boxTypeFilter as BoxType] ?? 0;
          }
          return d.activeBoxes;
        }),
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
      {
        name: '扫码UV',
        type: 'line',
        yAxisIndex: 1,
        data: data.map((d) => d.scanUV),
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 1.5, color: '#63B3ED', type: 'dashed' },
        itemStyle: { color: '#63B3ED' },
      },
    ],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>盒子趋势</div>
      <ReactEChartsCore
        echarts={echarts}
        option={option}
        style={{ height: 300 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        有效盒子数近两周持续下滑，但扫码UV波动较小，两条线出现背离趋势。
        说明单盒用户产出在提升，但设备离线问题正在削弱入口规模。
        建议关注雷客盒子的批量离线事件。
      </div>
    </div>
  );
}

/* ============================================================
   模块 B：盒子类型构成
   ============================================================ */
const TYPE_COLORS: Record<BoxType, string> = {
  '雷石盒子': '#3182CE',
  '雷客盒子': '#63B3ED',
  '小程序': '#38A169',
  '合作方盒子': '#A0AEC0',
};

function BoxTypeModule({ onSelectType }: { onSelectType: (t: string) => void }) {
  const data = deviceTrendData;

  const stackOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e8e8e8',
      textStyle: { color: '#333', fontSize: 12 },
    },
    legend: { top: 0, right: 0, textStyle: { fontSize: 12 } },
    grid: { top: 36, right: 20, bottom: 24, left: 55 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.date),
      axisLine: { lineStyle: { color: '#d9d9d9' } },
      axisLabel: { fontSize: 11, color: '#8c8c8c' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (v: number) => v >= 10000 ? (v / 10000).toFixed(1) + 'w' : String(v),
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: BOX_TYPES.map((type) => ({
      name: type,
      type: 'bar',
      stack: 'total',
      data: data.map((d) => d.byType[type]),
      itemStyle: { color: TYPE_COLORS[type] },
      barMaxWidth: 18,
    })),
  };

  const columns = [
    { title: '盒子类型', dataIndex: 'type', key: 'type' },
    {
      title: '有效盒子数',
      dataIndex: 'activeBoxes',
      key: 'activeBoxes',
      render: (v: number) => formatNumber(v),
      sorter: (a: typeof boxTypeData[0], b: typeof boxTypeData[0]) => a.activeBoxes - b.activeBoxes,
    },
    {
      title: '有效率',
      dataIndex: 'effectiveRate',
      key: 'effectiveRate',
      render: (v: number) => formatPercent(v),
    },
    {
      title: '单盒UV',
      dataIndex: 'uvPerBox',
      key: 'uvPerBox',
    },
    {
      title: '占比',
      dataIndex: 'ratio',
      key: 'ratio',
      render: (v: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className={styles.typeBar} style={{ width: `${v * 200}px` }} />
          <span>{(v * 100).toFixed(0)}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>盒子类型构成</div>
      <ReactEChartsCore
        echarts={echarts}
        option={stackOption}
        style={{ height: 260 }}
        opts={{ renderer: 'canvas' }}
        notMerge
      />
      <Table
        dataSource={boxTypeData}
        columns={columns}
        rowKey="type"
        size="small"
        pagination={false}
        onRow={(record) => ({
          onClick: () => onSelectType(record.type),
          style: { cursor: 'pointer' },
        })}
      />
      <div className={`${styles.insightBox} ${styles.warning}`}>
        <span className={styles.insightLabel}>洞察：</span>
        雷客盒子有效率仅 65%，显著低于雷石盒子（78%）和小程序（82%）。
        近期雷客盒子数量下降 18.5%，是整体有效盒子数下降的主因。
        建议排查渠道商是否批量关闭二维码。
      </div>
    </div>
  );
}

/* ============================================================
   模块 C：地域分布
   ============================================================ */
function GeoModule({
  provinces,
  mapReady,
  onSelectProvince,
}: {
  provinces: typeof provinceData;
  mapReady: boolean;
  onSelectProvince: (name: string) => void;
}) {
  const top10 = useMemo(
    () => [...provinces].sort((a, b) => b.activeBoxes - a.activeBoxes).slice(0, 10),
    [provinces],
  );

  const maxVal = Math.max(...provinces.map((p) => p.activeBoxes), 1);

  const mapOption: echarts.EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: { name: string; value: number; data?: { effectiveRate: number } }) => {
        if (!params.data) return params.name;
        return `${params.name}<br/>有效盒子：${formatNumber(params.value)}<br/>有效率：${formatPercent(params.data.effectiveRate)}`;
      },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      inRange: { color: ['#BEE3F8', '#63B3ED', '#3182CE', '#1a56a8'] },
      calculable: true,
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        type: 'map',
        map: 'china',
        roam: true,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 12 },
          itemStyle: { areaColor: '#ffd666' },
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 0.5,
        },
        data: provinces.map((p) => ({
          name: p.name,
          value: p.activeBoxes,
          effectiveRate: p.effectiveRate,
        })),
      },
    ],
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>地域分布</div>
      <div className={styles.geoLayout}>
        <div>
          {mapReady ? (
            <ReactEChartsCore
              echarts={echarts}
              option={mapOption}
              style={{ height: 420 }}
              opts={{ renderer: 'canvas' }}
              notMerge
              onEvents={{
                click: (params: { name: string }) => {
                  if (params.name) onSelectProvince(params.name);
                },
              }}
            />
          ) : (
            <div style={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
              地图加载中...
            </div>
          )}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1a202c', marginBottom: 8 }}>
            Top 10 省份
          </div>
          <table className={styles.rankTable}>
            <thead>
              <tr>
                <th style={{ width: 36 }}>#</th>
                <th>省份</th>
                <th>有效盒子</th>
                <th>有效率</th>
              </tr>
            </thead>
            <tbody>
              {top10.map((p, i) => (
                <tr key={p.name} onClick={() => onSelectProvince(p.name)} style={{ cursor: 'pointer' }}>
                  <td>
                    <span className={`${styles.rankIndex} ${i < 3 ? styles.rankTop : styles.rankNormal}`}>
                      {i + 1}
                    </span>
                  </td>
                  <td>{p.name}</td>
                  <td>{formatNumber(p.activeBoxes)}</td>
                  <td>{formatPercent(p.effectiveRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className={styles.insightBox}>
        <span className={styles.insightLabel}>洞察：</span>
        广东、浙江、江苏三省有效盒子数占全国 31.5%，呈强集中效应。
        上海、北京有效率最高（&gt;80%），西部地区普遍偏低。
        建议在低有效率地区推进设备运维巡检。
      </div>
    </div>
  );
}

/* ============================================================
   模块 D：异常定位链路
   ============================================================ */
function AnomalyModule() {
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleTitle}>
        <WarningOutlined style={{ color: 'var(--color-danger)', marginRight: 6 }} />
        异常定位链路
      </div>
      <AnomalyTree node={anomalyTree} depth={0} />
      <div className={`${styles.insightBox} ${styles.critical}`}>
        <span className={styles.insightLabel}>定位结论：</span>
        收入下降 8.5% 的根因是有效盒子数减少（-12%），其中雷客盒子批量离线（-18.5%）
        是最大贡献因素。转化率基本不变，排除用户端问题。建议立即排查雷客渠道商是否
        批量关闭二维码，并联系相关渠道商确认设备状态。
      </div>
    </div>
  );
}

function AnomalyTree({ node, depth }: { node: AnomalyNode; depth: number }) {
  return (
    <div className={depth > 0 ? styles.anomalyChildren : styles.anomalyFlow}>
      <div className={`${styles.anomalyNode} ${styles[node.status]}`}>
        <span>{node.label}</span>
        {node.value && <span className={styles.anomalyValue}>{node.value}</span>}
      </div>
      {node.children?.map((child) => (
        <div key={child.id}>
          <div className={styles.anomalyConnector} />
          <AnomalyTree node={child} depth={depth + 1} />
        </div>
      ))}
    </div>
  );
}
