/**
 * 模板编辑器组件
 */

import React, { useRef } from 'react';
import { Form, Input, Select, Row, Col, Card } from 'antd';
import { TEMPLATE_CATEGORY_CONFIG } from '@/types/template';
import { VariableHelper } from './VariableHelper';

const { TextArea } = Input;

interface TemplateEditorProps {
  form: any;
  initialValues?: any;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ form, initialValues }) => {
  const textAreaRef = useRef<any>(null);

  // 插入变量到光标位置
  const handleInsertVariable = (variable: string) => {
    const textArea = textAreaRef.current?.resizableTextArea?.textArea;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;
    const currentContent = form.getFieldValue('content') || '';
    const newContent = currentContent.substring(0, start) + variable + currentContent.substring(end);

    form.setFieldsValue({ content: newContent });

    // 设置光标位置到插入变量之后
    setTimeout(() => {
      textArea.focus();
      const newPosition = start + variable.length;
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <Row gutter={16}>
      <Col xs={24} lg={16}>
        <Card
          title="模板信息"
          style={{
            background: 'rgba(20, 241, 149, 0.03)',
            border: '1px solid rgba(20, 241, 149, 0.2)',
          }}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={initialValues || { language: 'en', aiGenerated: false }}
          >
            <Form.Item
              label="模板名称"
              name="name"
              rules={[
                { required: true, message: '请输入模板名称' },
                { max: 100, message: '模板名称不能超过100个字符' },
              ]}
            >
              <Input placeholder="例如：初次联系模板" size="large" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="模板分类"
                  name="category"
                  rules={[{ required: true, message: '请选择模板分类' }]}
                >
                  <Select placeholder="选择分类" size="large">
                    {Object.entries(TEMPLATE_CATEGORY_CONFIG).map(([key, config]) => (
                      <Select.Option key={key} value={key}>
                        <span style={{ marginRight: '8px' }}>{config.icon}</span>
                        {config.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="语言"
                  name="language"
                  rules={[{ required: true, message: '请选择语言' }]}
                >
                  <Select placeholder="选择语言" size="large">
                    <Select.Option value="en">英语 (English)</Select.Option>
                    <Select.Option value="zh">中文 (Chinese)</Select.Option>
                    <Select.Option value="es">西班牙语 (Spanish)</Select.Option>
                    <Select.Option value="pt">葡萄牙语 (Portuguese)</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="模板内容"
              name="content"
              rules={[
                { required: true, message: '请输入模板内容' },
                { max: 5000, message: '模板内容不能超过5000个字符' },
              ]}
            >
              <TextArea
                ref={textAreaRef}
                placeholder="输入模板内容，可以使用变量，例如: Hello {{username}}!..."
                rows={12}
                style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  background: 'rgba(0, 0, 0, 0.02)',
                }}
              />
            </Form.Item>

            <Form.Item label="AI 生成" name="aiGenerated" valuePropName="checked">
              <Select size="large">
                <Select.Option value={false}>否</Select.Option>
                <Select.Option value={true}>是</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <VariableHelper onInsert={handleInsertVariable} />
      </Col>
    </Row>
  );
};
