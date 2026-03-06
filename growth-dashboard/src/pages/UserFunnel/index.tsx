import { Result } from 'antd';
import { FunnelPlotOutlined } from '@ant-design/icons';

export default function UserFunnel() {
  return (
    <Result
      icon={<FunnelPlotOutlined style={{ color: '#3182CE' }} />}
      title="用户漏斗"
      subTitle="页面开发中，敬请期待"
    />
  );
}
