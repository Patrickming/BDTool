/**
 * 全局应用布局组件
 * 包含顶部导航栏和主题切换功能
 */

import { Layout, Menu, Dropdown, Avatar, Space } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  HomeOutlined,
  TeamOutlined,
  MessageOutlined,
  FileTextOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import type { MenuProps } from 'antd';

const { Header, Content } = Layout;

/**
 * 应用主布局组件 - 顶部导航栏
 */
export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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
    <Layout style={{ minHeight: '100vh', background: '#000000' }}>
      {/* 背景渐变层 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, rgba(153, 69, 255, 0.15), transparent),
            radial-gradient(ellipse 60% 50% at 10% 40%, rgba(20, 241, 149, 0.08), transparent),
            radial-gradient(ellipse 60% 50% at 90% 60%, rgba(220, 31, 255, 0.08), transparent)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 网格纹理 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.4,
        }}
      />

      {/* 顶部导航栏 - 高级立体风格 */}
      <Header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 48px',
          background: 'linear-gradient(180deg, rgba(15, 15, 25, 0.98) 0%, rgba(10, 10, 18, 0.95) 100%)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          borderBottom: '1px solid rgba(153, 69, 255, 0.2)',
          boxShadow: `
            0 4px 24px rgba(0, 0, 0, 0.5),
            0 1px 0 0 rgba(153, 69, 255, 0.3),
            inset 0 1px 0 0 rgba(255, 255, 255, 0.05)
          `,
          height: 72,
        }}
      >
        {/* 左侧：Logo */}
        <div
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '8px 16px',
            borderRadius: '12px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(153, 69, 255, 0.08)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 4px 16px rgba(153, 69, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              position: 'relative',
            }}
          >
            K
          </div>
          <span
            style={{
              fontSize: 18,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
            }}
          >
            KOL BD Tool
          </span>
        </div>

        {/* 中间：导航菜单 */}
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{
            background: 'transparent',
            border: 'none',
            flex: 1,
            justifyContent: 'center',
            maxWidth: 600,
          }}
          theme="dark"
        />

        {/* 右侧：用户信息 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.02)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(153, 69, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(153, 69, 255, 0.3)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(153, 69, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Avatar
              size={36}
              style={{
                background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                fontWeight: 700,
                fontSize: 16,
                boxShadow: '0 2px 8px rgba(153, 69, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              }}
            >
              {user?.fullName?.[0]?.toUpperCase()}
            </Avatar>
            <span
              style={{
                color: '#ffffff',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              {user?.fullName}
            </span>
          </div>
        </Dropdown>
      </Header>

      {/* 页面内容 */}
      <Content
        style={{
          marginTop: 72,
          padding: '40px 48px',
          minHeight: 'calc(100vh - 72px)',
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
          }}
        >
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
}
