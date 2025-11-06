/**
 * 用户注册页面 - Web3 简约高级风格
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/auth.store';
import * as authService from '@/services/auth.service';
import type { RegisterForm } from '@/types/auth';

const { Title, Text } = Typography;

export default function Register() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const onFinish = async (values: RegisterForm) => {
    setLoading(true);

    try {
      const { user, token } = await authService.register({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      });

      setUser(user, token);
      message.success('注册成功！');
      navigate('/');
    } catch (error: any) {
      message.error(error.message || '注册失败，请重试');
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
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
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
            创建账户
          </Title>
          <Text style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
            欢迎使用 KOL BD Tool
          </Text>
        </div>

        {/* 表单 */}
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          size="large"
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

          {/* 姓名 */}
          <Form.Item
            name="fullName"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' },
              { min: 2, message: '姓名至少需要 2 个字符' },
              { max: 100, message: '姓名最多 100 个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="张三"
            />
          </Form.Item>

          {/* 密码 */}
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 8, message: '密码至少需要 8 个字符' },
              { max: 128, message: '密码最多 128 个字符' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: '密码必须包含大写字母、小写字母和数字',
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="至少 8 个字符"
            />
          </Form.Item>

          {/* 确认密码 */}
          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
              placeholder="再次输入密码"
            />
          </Form.Item>

          {/* 提交按钮 */}
          <Form.Item style={{ marginBottom: 16, marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: 48 }}
            >
              创建账户
            </Button>
          </Form.Item>

          {/* 登录链接 */}
          <div style={{ textAlign: 'center' }}>
            <Text style={{ color: 'var(--text-secondary)' }}>
              已有账户？{' '}
              <Link to="/login" style={{ fontWeight: 600 }}>
                立即登录
              </Link>
            </Text>
          </div>
        </Form>
      </div>
    </div>
  );
}
