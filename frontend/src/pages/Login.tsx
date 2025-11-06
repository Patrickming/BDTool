/**
 * 用户登录页面 - Web3 简约高级风格
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Typography, Checkbox } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import * as authService from '@/services/auth.service';
import type { LoginForm } from '@/types/auth';

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const onFinish = async (values: LoginForm & { remember?: boolean }) => {
    setLoading(true);

    try {
      const { user, token } = await authService.login({
        email: values.email,
        password: values.password,
      });

      setUser(user, token);
      message.success('登录成功！');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* 背景装饰 */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-10%',
        left: '-5%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(80px)',
      }} />

      {/* 主卡片 */}
      <div style={{
        width: '450px',
        padding: '48px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-xl)',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* 标题 */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={1} style={{
            fontSize: '32px',
            fontWeight: 700,
            marginBottom: 8,
            background: 'var(--brand-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            欢迎回来
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            登录到 KOL BD Tool
          </Text>
        </div>

        {/* 表单 */}
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
          initialValues={{ remember: true }}
        >
          {/* 邮箱 */}
          <Form.Item
            name="email"
            label="邮箱地址"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="your@example.com"
            />
          </Form.Item>

          {/* 密码 */}
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="请输入密码"
            />
          </Form.Item>

          {/* 记住我 */}
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox style={{ color: 'var(--text-secondary)' }}>
                  记住我
                </Checkbox>
              </Form.Item>
              <a style={{ fontSize: '14px' }}>忘记密码？</a>
            </div>
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item style={{ marginBottom: 16, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 48 }}
            >
              登录
            </Button>
          </Form.Item>

          {/* 注册链接 */}
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'var(--text-secondary)' }}>
              还没有账户？{' '}
              <Link to="/register" style={{ fontWeight: 600 }}>
                立即注册
              </Link>
            </Text>
          </div>
        </Form>
      </div>
    </div>
  );
}
