import { Result } from 'antd';
import { NotificationOutlined } from '@ant-design/icons';

export default function AdEfficiency() {
  return (
    <Result
      icon={<NotificationOutlined style={{ color: '#3182CE' }} />}
      title="广告位效率"
      subTitle="页面开发中，敬请期待"
    />
  );
}
