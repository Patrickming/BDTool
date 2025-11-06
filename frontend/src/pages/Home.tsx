/**
 * 首页
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth, loadUser } = useAuthStore();

  useEffect(() => {
    // 如果未登录，跳转到登录页
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // 加载用户信息
    loadUser();
  }, [isAuthenticated, navigate, loadUser]);

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>KOL BD Tool</Title>
          <Text type="secondary">BD 管理系统</Text>
        </div>

        <Card
          title="用户信息"
          extra={
            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              退出登录
            </Button>
          }
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>姓名：</Text>
              <Text>{user.fullName}</Text>
            </div>
            <div>
              <Text strong>邮箱：</Text>
              <Text>{user.email}</Text>
            </div>
            <div>
              <Text strong>角色：</Text>
              <Text>{user.role === 'admin' ? '管理员' : '普通成员'}</Text>
            </div>
            <div>
              <Text strong>用户 ID：</Text>
              <Text>{user.id}</Text>
            </div>
          </Space>
        </Card>

        <Card title="功能列表" style={{ marginTop: 24 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button type="primary" block disabled>
              KOL 管理（待实现）
            </Button>
            <Button type="primary" block disabled>
              模板管理（待实现）
            </Button>
            <Button type="primary" block disabled>
              联系记录（待实现）
            </Button>
          </Space>
        </Card>
      </Card>
    </div>
  );
}
