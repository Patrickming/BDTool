/**
 * 首页 - Web3 简约高级风格
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Typography, Row, Col, Spin } from 'antd';
import { UserOutlined, DatabaseOutlined, FileTextOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';

const { Title, Text } = Typography;

export default function Home() {
  const navigate = useNavigate();
  const { user, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    // 检查是否有 token
    const token = localStorage.getItem('auth_token');

    if (!token) {
      // 没有 token，跳转到登录页
      navigate('/login');
      return;
    }

    // 有 token，尝试加载用户信息
    if (!user) {
      loadUser().catch(() => {
        // 加载失败，跳转到登录页
        navigate('/login');
      });
    }
  }, [user, navigate, loadUser]);

  // 加载中
  if (isLoading) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 没有用户信息
  if (!user) {
    return null;
  }

  return (
    <div className="animate-fade-in-up">

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
              <div
                onClick={() => navigate('/kols')}
                className="hover-lift"
                style={{
                  padding: 24,
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--gradient-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                  boxShadow: 'var(--shadow-glow)',
                }}>
                  <DatabaseOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  KOL 管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  管理 KOL 数据库，筛选和评分
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Text
                    className="text-gradient"
                    style={{ fontSize: 12, fontWeight: 600 }}
                  >
                    立即使用 →
                  </Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div style={{
                padding: 24,
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'not-allowed',
                opacity: 0.6,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(220, 31, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <FileTextOutlined style={{ fontSize: 24, color: 'var(--solana-pink)' }} />
                </div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  模板管理
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  话术模板，AI 生成
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>待实现</Text>
                </div>
              </div>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <div style={{
                padding: 24,
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-secondary)',
                borderRadius: 'var(--radius-md)',
                cursor: 'not-allowed',
                opacity: 0.6,
                transition: 'all 0.3s ease',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(20, 241, 149, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <PhoneOutlined style={{ fontSize: 24, color: 'var(--solana-green)' }} />
                </div>
                <Title level={4} style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>
                  联系记录
                </Title>
                <Text style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                  历史记录，统计分析
                </Text>
                <div style={{ marginTop: 16 }}>
                  <Text style={{ color: 'var(--text-muted)', fontSize: 12 }}>待实现</Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>
    </div>
  );
}
