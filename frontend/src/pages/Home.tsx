/**
 * 首页 - Web3 简约高级风格
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Space, Row, Col, Divider } from 'antd';
import { LogoutOutlined, UserOutlined, DatabaseOutlined, FileTextOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated, clearAuth, loadUser } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
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
      background: 'var(--bg-primary)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: '10%',
        right: '0',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* 顶部标题栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 48,
          padding: '24px 32px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div>
            <Title level={2} style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              background: 'var(--brand-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              KOL BD Tool
            </Title>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: 4 }}>
              Web3 BD 管理系统
            </Text>
          </div>
          <Button
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              height: 40,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            退出登录
          </Button>
        </div>

        {/* 用户信息卡片 */}
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--brand-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <UserOutlined style={{ fontSize: 20, color: 'white' }} />
              </div>
              <span style={{ fontSize: 18, fontWeight: 600 }}>用户信息</span>
            </div>
          }
          style={{ marginBottom: 24 }}
        >
          <Row gutter={[24, 16]}>
            <Col span={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>姓名</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>{user.fullName}</Text>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>邮箱</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>{user.email}</Text>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>角色</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>
                    {user.role === 'admin' ? '管理员' : '普通成员'}
                  </Text>
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 13 }}>用户 ID</Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 16, fontWeight: 500 }}>#{user.id}</Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 功能模块卡片 */}
        <Card
          title={
            <span style={{ fontSize: 18, fontWeight: 600 }}>功能模块</span>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8}>
              <div style={{
                padding: 24,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'not-allowed',
                opacity: 0.6,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(99, 102, 241, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <DatabaseOutlined style={{ fontSize: 24, color: 'var(--brand-primary)' }} />
                </div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  KOL 管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  管理 KOL 数据库，筛选和评分
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>待实现</Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div style={{
                padding: 24,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'not-allowed',
                opacity: 0.6,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <FileTextOutlined style={{ fontSize: 24, color: '#8b5cf6' }} />
                </div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  模板管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  话术模板，AI 生成
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>待实现</Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div style={{
                padding: 24,
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'not-allowed',
                opacity: 0.6,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <PhoneOutlined style={{ fontSize: 24, color: 'var(--success)' }} />
                </div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  联系记录
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  历史记录，统计分析
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>待实现</Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
}
