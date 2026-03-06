import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import DeviceEfficiency from './pages/DeviceEfficiency';
import UserFunnel from './pages/UserFunnel';
import RevenueStructure from './pages/RevenueStructure';
import UserSegmentation from './pages/UserSegmentation';
import AdEfficiency from './pages/AdEfficiency';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'device-efficiency', element: <DeviceEfficiency /> },
      { path: 'user-funnel', element: <UserFunnel /> },
      { path: 'revenue-structure', element: <RevenueStructure /> },
      { path: 'user-segmentation', element: <UserSegmentation /> },
      { path: 'ad-efficiency', element: <AdEfficiency /> },
    ],
  },
]);
