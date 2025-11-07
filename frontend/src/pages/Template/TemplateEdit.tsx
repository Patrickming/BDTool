/**
 * 编辑模板页面
 */

import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Form, Space, Typography, Spin } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useTemplateStore } from '@/store/template.store';
import { TemplateEditor } from '@/components/Template/TemplateEditor';

const { Title } = Typography;

export const TemplateEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const { currentTemplate, loading, fetchTemplateById, updateTemplate } = useTemplateStore();

  useEffect(() => {
    if (id) {
      fetchTemplateById(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (currentTemplate) {
      form.setFieldsValue(currentTemplate);
    }
  }, [currentTemplate, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateTemplate(parseInt(id!), values);
      navigate('/templates');
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  if (loading && !currentTemplate) {
    return (
      <div style={{ padding: '100px', textAlign: 'center' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

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
                ✏️ 编辑模板
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
              保存更改
            </Button>
          </div>

          {/* 编辑器 */}
          <TemplateEditor form={form} initialValues={currentTemplate || undefined} />
        </Space>
      </Card>
    </div>
  );
};
