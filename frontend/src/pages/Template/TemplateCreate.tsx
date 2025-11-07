/**
 * 创建模板页面
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Space, Typography } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useTemplateStore } from '@/store/template.store';
import { TemplateEditor } from '@/components/Template/TemplateEditor';

const { Title } = Typography;

export const TemplateCreate: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { createTemplate, loading } = useTemplateStore();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createTemplate(values);
      navigate('/templates');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        className="animate-fade-in-up"
        style={{
          background: 'rgba(20, 241, 149, 0.05)',
          border: '1px solid rgba(20, 241, 149, 0.2)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 头部 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/templates')}
                size="large"
              >
                返回
              </Button>
              <Title level={2} style={{ margin: 0 }}>
                ✨ 创建模板
              </Title>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              onClick={handleSubmit}
              loading={loading}
              className="hover-lift"
            >
              保存模板
            </Button>
          </div>

          {/* 编辑器 */}
          <TemplateEditor form={form} />
        </Space>
      </Card>
    </div>
  );
};
