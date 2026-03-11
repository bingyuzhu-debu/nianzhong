import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Progress, Modal } from 'antd';
import { SettingOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import KpiCard from '../../components/KpiCard';
import HealthRadarChart from '../../components/charts/HealthRadarChart';
import AlertList from '../../components/InsightBox';
import {
  kpiData,
  alertData,
  radarData,
  diagnosisFactors,
  diagnosisConclusion,
  targetAchievementData,
  avgSongsPerUserKpi,
} from '../../mock';
import type { FilterState } from '../../types';
import type { DiagnosisFactor } from '../../mock';
import { formatKpiValue, formatRate } from '../../utils/format';
import styles from './index.module.css';

// Reorder KPI: totalRevenue first, then add avgSongsPerUser
const reorderedKpiData = [
  kpiData.find(k => k.key === 'totalRevenue')!,
  ...kpiData.filter(k => k.key !== 'totalRevenue'),
  avgSongsPerUserKpi,
];

export default function Dashboard() {
  const { filter } = useOutletContext<{ filter: FilterState }>();
  const [showTargetModal, setShowTargetModal] = useState(false);

  return (
    <div className={styles.page}>
      {/* KPI 卡片区 */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiGrid}>
          {reorderedKpiData.map((kpi) => (
            <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
          ))}
        </div>
        <TargetCard onSettings={() => setShowTargetModal(true)} />
      </div>

      {/* 五因子诊断区 */}
      <DiagnosisModule />

      {/* 异常预警 + 健康雷达 */}
      <div className={styles.bottomRow}>
        <div className={styles.alertCard}>
          <AlertList alerts={alertData} />
        </div>
        <div className={styles.radarCard}>
          <HealthRadarChart data={radarData} />
        </div>
      </div>

      <Modal
        title="设置收入目标"
        open={showTargetModal}
        onCancel={() => setShowTargetModal(false)}
        footer={null}
      >
        <p style={{ color: '#8c8c8c', fontSize: 13 }}>
          目标值设置功能即将上线，当前使用默认目标值。
        </p>
      </Modal>
    </div>
  );
}

/* ============================================================
   目标达成率卡片
   ============================================================ */
function TargetCard({ onSettings }: { onSettings: () => void }) {
  const monthData = targetAchievementData.find(d => d.period === '月')!;
  const yearData = targetAchievementData.find(d => d.period === '年')!;
  const dailyData = targetAchievementData.find(d => d.period === '日')!;

  return (
    <div className={styles.targetCard}>
      <div className={styles.targetHeader}>
        <span className={styles.targetTitle}>目标达成</span>
        <SettingOutlined className={styles.targetSettings} onClick={onSettings} />
      </div>
      <div className={styles.targetMain}>
        <Progress
          type="circle"
          percent={Math.round(monthData.rate * 100)}
          size={80}
          strokeColor={monthData.rate >= 0.9 ? '#38A169' : monthData.rate >= 0.7 ? '#ED8936' : '#E53E3E'}
          format={(p) => <span style={{ fontSize: 16, fontWeight: 600 }}>{p}%</span>}
        />
        <div className={styles.targetDetail}>
          <div className={styles.targetLine}>
            <span>本月</span>
            <span style={{ fontWeight: 600 }}>¥{(monthData.actual / 10000).toFixed(1)}万</span>
            <span style={{ color: '#8c8c8c' }}>/ ¥{(monthData.target / 10000).toFixed(0)}万</span>
          </div>
          <div className={styles.targetLine}>
            <span>今日</span>
            <span style={{ fontWeight: 600 }}>¥{(dailyData.actual / 10000).toFixed(2)}万</span>
            <span style={{ color: dailyData.rate >= 1 ? '#38A169' : '#E53E3E' }}>
              {(dailyData.rate * 100).toFixed(1)}%
            </span>
          </div>
          <div className={styles.targetLine}>
            <span>年度</span>
            <span style={{ fontWeight: 600 }}>¥{(yearData.actual / 10000).toFixed(0)}万</span>
            <span style={{ color: yearData.rate >= 0.8 ? '#38A169' : '#ED8936' }}>
              {(yearData.rate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   五因子诊断模块
   ============================================================ */
function DiagnosisModule() {
  const navigate = useNavigate();

  return (
    <div className={styles.diagnosisCard}>
      <div className={styles.diagnosisTitle}>五因子诊断</div>
      <div className={styles.formulaBar}>
        <span className={styles.formulaText}>
          收入 = 有效盒子数 × 单盒UV × H5进入率 × 付费转化率 × 客单价
        </span>
      </div>
      <div className={styles.factorGrid}>
        {diagnosisFactors.map((factor, i) => (
          <FactorCard
            key={factor.key}
            factor={factor}
            isLast={i === diagnosisFactors.length - 1}
            onClick={() => navigate(factor.linkedPath)}
          />
        ))}
      </div>
      <div className={styles.diagnosisConclusion}>
        <div className={styles.conclusionTitle}>诊断结论</div>
        <div className={styles.conclusionText}>{diagnosisConclusion.text}</div>
        <div className={styles.conclusionRoot}>
          <strong>根因：</strong>{diagnosisConclusion.rootCause}
        </div>
      </div>
    </div>
  );
}

function FactorCard({
  factor,
  isLast,
  onClick,
}: {
  factor: DiagnosisFactor;
  isLast: boolean;
  onClick: () => void;
}) {
  const statusStyles: Record<string, { bg: string; border: string; color: string; badge: string }> = {
    normal: { bg: '#f0fff4', border: '#c6f6d5', color: '#38A169', badge: '正常' },
    warning: { bg: '#fffff0', border: '#fefcbf', color: '#D69E2E', badge: '关注' },
    critical: { bg: '#fff5f5', border: '#fed7d7', color: '#E53E3E', badge: '异常' },
  };
  const s = statusStyles[factor.status];
  const TrendIcon = factor.changeRate > 0 ? ArrowUpOutlined
    : factor.changeRate < 0 ? ArrowDownOutlined
    : MinusOutlined;
  const trendColor = factor.changeRate < 0 ? '#E53E3E' : factor.changeRate > 0 ? '#38A169' : '#8c8c8c';

  return (
    <>
      <div
        className={styles.factorCard}
        style={{ background: s.bg, borderColor: s.border }}
        onClick={onClick}
      >
        <div className={styles.factorHeader}>
          <span className={styles.factorName}>{factor.name}</span>
          <span className={styles.factorBadge} style={{ background: s.color }}>
            {s.badge}
          </span>
        </div>
        <div className={styles.factorValue}>
          {formatKpiValue(factor.value, factor.format)}
          {factor.unit && <span className={styles.factorUnit}>{factor.unit}</span>}
        </div>
        <div className={styles.factorChange} style={{ color: trendColor }}>
          <TrendIcon style={{ fontSize: 10, marginRight: 2 }} />
          {formatRate(Math.abs(factor.changeRate))}
        </div>
      </div>
      {!isLast && <span className={styles.factorOperator}>×</span>}
    </>
  );
}
