import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { router } from './routes';

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#3182CE',
          borderRadius: 6,
          fontSize: 13,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
}
