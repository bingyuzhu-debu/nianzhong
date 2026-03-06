import { Result } from 'antd';
import { DollarOutlined } from '@ant-design/icons';

export default function RevenueStructure() {
  return (
    <Result
      icon={<DollarOutlined style={{ color: '#3182CE' }} />}
      title="营收结构"
      subTitle="页面开发中，敬请期待"
    />
  );
}
