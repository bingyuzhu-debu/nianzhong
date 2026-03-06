import { Result } from 'antd';
import { HddOutlined } from '@ant-design/icons';

export default function DeviceEfficiency() {
  return (
    <Result
      icon={<HddOutlined style={{ color: '#3182CE' }} />}
      title="设备效率"
      subTitle="页面开发中，敬请期待"
    />
  );
}
