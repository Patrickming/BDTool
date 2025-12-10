/**
 * 主应用组件
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import KOLList from '@/pages/KOL/KOLList';
import KOLImport from '@/pages/KOL/KOLImport';
import KOLDetail from '@/pages/KOL/KOLDetail';
import { TemplateList } from '@/pages/Template/TemplateList';
import { TemplateCreate } from '@/pages/Template/TemplateCreate';
import { TemplateEdit } from '@/pages/Template/TemplateEdit';
import { AnalyticsDashboard } from '@/pages/AnalyticsDashboard';
import Extension from '@/pages/Extension';
import AppLayout from '@/components/Layout/AppLayout';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#9945FF',
          colorSuccess: '#14F195',
          colorInfo: '#00D4AA',
          borderRadius: 8,
          fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          {/* 公开路由（无布局） */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 认证路由（使用 AppLayout） */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            {/* 个人资料路由 */}
            <Route path="/profile" element={<Profile />} />
            {/* KOL 管理路由 */}
            <Route path="/kols" element={<KOLList />} />
            <Route path="/kols/import" element={<KOLImport />} />
            <Route path="/kols/:id" element={<KOLDetail />} />
            {/* 模板管理路由 */}
            <Route path="/templates" element={<TemplateList />} />
            <Route path="/templates/create" element={<TemplateCreate />} />
            <Route path="/templates/:id/edit" element={<TemplateEdit />} />
            {/* 分析统计路由 */}
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            {/* 插件管理路由 */}
            <Route path="/extension" element={<Extension />} />
          </Route>

          {/* 404 重定向 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
