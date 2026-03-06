import { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  HddOutlined,
  FunnelPlotOutlined,
  DollarOutlined,
  TeamOutlined,
  NotificationOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import GlobalFilter from '../components/GlobalFilter';
import type { FilterState } from '../types';
import dayjs from 'dayjs';

const { Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '驾驶舱' },
  { key: '/device-efficiency', icon: <HddOutlined />, label: '设备效率' },
  { key: '/user-funnel', icon: <FunnelPlotOutlined />, label: '用户漏斗' },
  { key: '/revenue-structure', icon: <DollarOutlined />, label: '营收结构' },
  { key: '/user-segmentation', icon: <TeamOutlined />, label: '用户分层' },
  { key: '/ad-efficiency', icon: <NotificationOutlined />, label: '广告位效率' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    dateRange: [dayjs().subtract(6, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')],
    granularity: 'day',
    compareMode: false,
  });

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={220}
        style={{ background: '#001529' }}
      >
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? 0 : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          gap: 10,
        }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #3182CE 0%, #63B3ED 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>G</span>
          </div>
          {!collapsed && (
            <span style={{
              color: 'rgba(255,255,255,0.92)',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}>
              雷石数据中台
            </span>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 4 }}
        />
      </Sider>
      <Layout>
        <GlobalFilter filter={filter} onChange={setFilter} />
        <Content style={{
          padding: 20,
          background: '#f0f2f5',
          overflow: 'auto',
        }}>
          <Outlet context={{ filter }} />
        </Content>
      </Layout>
    </Layout>
  );
}
