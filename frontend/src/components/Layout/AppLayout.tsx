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
  ChromeOutlined,
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
      key: '/extension',
      icon: <ChromeOutlined />,
      label: '插件内容',
      onClick: () => navigate('/extension'),
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
    if (path.startsWith('/extension')) return '/extension';
    return '/';
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#000000' }}>
      {/* Solana 风格背景层 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse 100% 60% at 50% -10%, rgba(153, 69, 255, 0.25), transparent 50%),
            radial-gradient(ellipse 80% 50% at 20% 50%, rgba(220, 31, 255, 0.15), transparent 50%),
            radial-gradient(ellipse 80% 50% at 80% 50%, rgba(20, 241, 149, 0.15), transparent 50%),
            radial-gradient(circle at 10% 80%, rgba(255, 140, 0, 0.08), transparent 40%),
            radial-gradient(circle at 90% 20%, rgba(153, 69, 255, 0.12), transparent 40%),
            linear-gradient(180deg, #0a0a0f 0%, #000000 100%)
          `,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* 几何图形层 - 模拟 Solana 的抽象图形 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {/* 左上角大圆 */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(153, 69, 255, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />

        {/* 右侧渐变形状 */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            right: '-15%',
            width: '60%',
            height: '60%',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            background: 'radial-gradient(ellipse, rgba(20, 241, 149, 0.12) 0%, transparent 70%)',
            filter: 'blur(100px)',
            transform: 'rotate(-15deg)',
          }}
        />

        {/* 底部紫色光晕 */}
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            left: '30%',
            width: '40%',
            height: '40%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(220, 31, 255, 0.18) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />

        {/* 中间橙色点缀 */}
        <div
          style={{
            position: 'absolute',
            top: '40%',
            left: '10%',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 140, 0, 0.08) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
      </div>

      {/* 微妙的网格纹理 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            linear-gradient(rgba(153, 69, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(153, 69, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.3,
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
            gap: 10,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            padding: '6px 12px',
            borderRadius: '12px',
            flexShrink: 0,
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
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 700,
              color: 'white',
              boxShadow: '0 4px 16px rgba(153, 69, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
              flexShrink: 0,
            }}
          >
            K
          </div>
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.03em',
              whiteSpace: 'nowrap',
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
            maxWidth: 800,
            minWidth: 0,
          }}
          theme="dark"
        />

        {/* 右侧：用户信息 */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid transparent',
              background: 'transparent',
              flexShrink: 0,
              maxWidth: '180px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(153, 69, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(153, 69, 255, 0.2)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <Avatar
              size={30}
              style={{
                background: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)',
                fontWeight: 700,
                fontSize: 13,
                boxShadow: '0 2px 8px rgba(153, 69, 255, 0.25)',
                flexShrink: 0,
              }}
            >
              {user?.fullName?.[0]?.toUpperCase()}
            </Avatar>
            <span
              style={{
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                fontSize: 14,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
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
