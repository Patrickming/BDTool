/**
 * 全局应用布局组件
 * 包含顶部导航栏和主题切换功能
 */

import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;

/**
 * 应用主布局组件 - 顶部导航栏
 */
export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { user, clearAuth } = useAuthStore();

  // 处理登出
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // 顶部导航菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: '/kols',
      icon: <TeamOutlined />,
      label: 'KOL 管理',
      onClick: () => navigate('/kols'),
    },
    {
      key: '/templates',
      icon: <FileTextOutlined />,
      label: '模板管理',
      onClick: () => navigate('/templates'),
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据分析',
      onClick: () => navigate('/analytics'),
    },
    {
      key: '/contacts',
      icon: <MessageOutlined />,
      label: '联系记录',
      onClick: () => navigate('/contacts'),
      disabled: true, // 待开发功能
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
      onClick: () => navigate('/settings'),
      disabled: true, // 待开发功能
    },
  ];

  // 用户下拉菜单
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      disabled: true, // 待开发功能
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  // 获取当前激活的菜单项
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/kols')) return '/kols';
    if (path.startsWith('/templates')) return '/templates';
    if (path.startsWith('/analytics')) return '/analytics';
    if (path.startsWith('/contacts')) return '/contacts';
    if (path.startsWith('/settings')) return '/settings';
    return '/';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 背景粒子效果 */}
      <div className="particles-bg" />

      {/* 顶部导航栏 */}
      <Header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderBottom: '1px solid rgba(153, 69, 255, 0.2)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
          height: 70,
        }}
      >
        {/* 左侧：Logo + 导航菜单 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="hover-lift"
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 700,
                color: 'white',
                boxShadow: '0 0 30px rgba(153, 69, 255, 0.6)',
              }}
              className="animate-pulse-glow"
            >
              K
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
              }}
              className="animate-gradient"
            >
              KOL BD Tool
            </span>
          </div>

          {/* 导航菜单 */}
          <Menu
            mode="horizontal"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              minWidth: 450,
              flex: 1,
              fontSize: 15,
            }}
            theme="dark"
          />
        </div>

        {/* 右侧：主题切换和用户信息 */}
        <Space size={12}>
          {/* 主题切换按钮 */}
          <Button
            type="text"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{
              fontSize: 18,
              width: 44,
              height: 44,
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="hover-glow"
          />

          {/* 用户下拉菜单 */}
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className="hover-lift"
            >
              <Avatar
                size={36}
                style={{
                  background: 'var(--gradient-primary)',
                  border: '2px solid rgba(153, 69, 255, 0.5)',
                  boxShadow: '0 0 20px rgba(153, 69, 255, 0.4)',
                }}
              >
                {user?.fullName?.[0]?.toUpperCase()}
              </Avatar>
              <span
                style={{
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  fontSize: 15,
                }}
              >
                {user?.fullName}
              </span>
            </div>
          </Dropdown>
        </Space>
      </Header>

      {/* 页面内容 */}
      <Content
        style={{
          marginTop: 70, // 为固定顶部导航栏留出空间
          padding: '28px',
          minHeight: 'calc(100vh - 70px)',
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.6) 0%, rgba(22, 33, 62, 0.6) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(153, 69, 255, 0.2)',
            padding: '32px',
            minHeight: 'calc(100vh - 126px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
          className="animate-fade-in-up"
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
