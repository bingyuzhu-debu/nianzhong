import { Tabs } from 'antd';
import UserFunnel from '../UserFunnel';
import UserSegmentation from '../UserSegmentation';
import styles from './index.module.css';

export default function UserAnalysis() {
  return (
    <div className={styles.page}>
      <Tabs
        defaultActiveKey="funnel"
        type="card"
        size="small"
        items={[
          { key: 'funnel', label: '用户漏斗', children: <UserFunnel /> },
          { key: 'segmentation', label: '用户分层', children: <UserSegmentation /> },
        ]}
      />
    </div>
  );
}
