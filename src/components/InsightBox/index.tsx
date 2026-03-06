import { Link } from 'react-router-dom';
import type { AlertItem } from '../../types';
import { getAlertColor, getAlertIcon } from '../../utils/theme';
import styles from './index.module.css';

interface AlertListProps {
  alerts: AlertItem[];
}

export default function AlertList({ alerts }: AlertListProps) {
  return (
    <div className={styles.container}>
      <div className={styles.title}>异常预警</div>
      <div className={styles.list}>
        {alerts.map((alert) => (
          <Link
            key={alert.dimension}
            to={alert.path}
            className={styles.item}
            style={{ borderLeftColor: getAlertColor(alert.level) }}
          >
            <div className={styles.itemHeader}>
              <span className={styles.icon}>{getAlertIcon(alert.level)}</span>
              <span className={styles.dimension}>{alert.dimension}</span>
              <span
                className={styles.badge}
                style={{
                  background: getAlertColor(alert.level) + '18',
                  color: getAlertColor(alert.level),
                }}
              >
                {alert.level === 'critical' ? '严重' : alert.level === 'warning' ? '警告' : '正常'}
              </span>
            </div>
            <div className={styles.description}>{alert.description}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
