/**
 * 主应用组件
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import KOLList from '@/pages/KOL/KOLList';
import KOLImport from '@/pages/KOL/KOLImport';
import { useThemeStore } from '@/store/theme.store';

function App() {
  const theme = useThemeStore((state) => state.theme);

  // 初始化主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* KOL 管理路由 */}
          <Route path="/kols" element={<KOLList />} />
          <Route path="/kols/import" element={<KOLImport />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
