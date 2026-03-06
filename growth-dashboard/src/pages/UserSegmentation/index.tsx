import { Result } from 'antd';
import { TeamOutlined } from '@ant-design/icons';

export default function UserSegmentation() {
  return (
    <Result
      icon={<TeamOutlined style={{ color: '#3182CE' }} />}
      title="用户分层"
      subTitle="页面开发中，敬请期待"
    />
  );
}
