import { createBrowserRouter } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import DeviceEfficiency from './pages/DeviceEfficiency';
import UserAnalysis from './pages/UserAnalysis';
import RevenueStructure from './pages/RevenueStructure';
import AdEfficiency from './pages/AdEfficiency';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'device-efficiency', element: <DeviceEfficiency /> },
      { path: 'user-analysis', element: <UserAnalysis /> },
      { path: 'revenue-structure', element: <RevenueStructure /> },
      { path: 'ad-efficiency', element: <AdEfficiency /> },
    ],
  },
]);
