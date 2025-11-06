/**
 * 导航栏组件 - Web3 简约高级风格
 */

import { Button } from 'antd';
import { SunOutlined, MoonOutlined, LogoutOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/store/theme.store';
import { useAuthStore } from '@/store/auth.store';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const theme = useThemeStore((state) => state.theme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      background: 'var(--glass-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--glass-border)',
      padding: '16px 32px',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* 左侧 - Logo 和标题 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--brand-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px',
            color: 'white',
          }}>
            K
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            KOL BD Tool
          </h1>
        </div>

        {/* 右侧 - 用户信息和操作 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* 用户名 */}
          {user && (
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              {user.fullName}
            </span>
          )}

          {/* 主题切换按钮 */}
          <Button
            type="text"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
            style={{
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />

          {/* 退出登录按钮 */}
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        </div>
      </div>
    </nav>
  );
}
