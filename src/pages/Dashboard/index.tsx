import { useOutletContext } from 'react-router-dom';
import KpiCard from '../../components/KpiCard';
import RevenueTrendChart from '../../components/charts/RevenueTrendChart';
import HealthRadarChart from '../../components/charts/HealthRadarChart';
import AlertList from '../../components/InsightBox';
import { kpiData, revenueTrendData, alertData, radarData } from '../../mock';
import type { FilterState } from '../../types';
import styles from './index.module.css';

export default function Dashboard() {
  const { filter } = useOutletContext<{ filter: FilterState }>();

  return (
    <div className={styles.page}>
      <div className={styles.kpiGrid}>
        {kpiData.map((kpi) => (
          <KpiCard key={kpi.key} data={kpi} showCompare={filter.compareMode} />
        ))}
      </div>

      <div className={styles.middleRow}>
        <div className={styles.trendCard}>
          <RevenueTrendChart data={revenueTrendData} />
        </div>
        <div className={styles.alertCard}>
          <AlertList alerts={alertData} />
        </div>
      </div>

      <div className={styles.radarCard}>
        <HealthRadarChart data={radarData} />
      </div>
    </div>
  );
}
