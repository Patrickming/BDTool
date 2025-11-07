/**
 * 模板编辑器组件（多语言版本）
 */

import React, { useRef, useState } from 'react';
import { Form, Input, Select, Row, Col, Card, Button, Space, Tabs, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { TEMPLATE_CATEGORY_CONFIG, type TemplateVersionData } from '@/types/template';
import { VariableHelper } from './VariableHelper';

const { TextArea } = Input;

interface TemplateEditorProps {
  form: any;
  initialValues?: any;
}

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { value: 'en', label: '英语 (English)' },
  { value: 'zh', label: '中文 (Chinese)' },
  { value: 'ja', label: '日语 (Japanese)' },
  { value: 'es', label: '西班牙语 (Spanish)' },
  { value: 'pt', label: '葡萄牙语 (Portuguese)' },
];

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ form, initialValues }) => {
  // 语言版本状态
  const [versions, setVersions] = useState<TemplateVersionData[]>(
    initialValues?.versions || [{ language: 'en', content: '' }]
  );
  const [activeLanguage, setActiveLanguage] = useState<string>(versions[0]?.language || 'en');
  const textAreaRefs = useRef<{ [key: string]: any }>({});

  // 插入变量到当前活动语言的光标位置
  const handleInsertVariable = (variable: string) => {
    const textArea = textAreaRefs.current[activeLanguage]?.resizableTextArea?.textArea;
    if (!textArea) return;

    const start = textArea.selectionStart;
    const end = textArea.selectionEnd;

    // 找到当前语言版本
    const versionIndex = versions.findIndex(v => v.language === activeLanguage);
    if (versionIndex === -1) return;

    const currentContent = versions[versionIndex].content || '';
    const newContent = currentContent.substring(0, start) + variable + currentContent.substring(end);

    // 更新版本内容
    const newVersions = [...versions];
    newVersions[versionIndex].content = newContent;
    setVersions(newVersions);
    form.setFieldsValue({ versions: newVersions });

    // 设置光标位置到插入变量之后
    setTimeout(() => {
      textArea.focus();
      const newPosition = start + variable.length;
      textArea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // 添加新语言版本
  const handleAddLanguage = (language: string) => {
    if (versions.some(v => v.language === language)) {
      message.warning('该语言版本已存在');
      return;
    }

    const newVersions = [...versions, { language, content: '' }];
    setVersions(newVersions);
    form.setFieldsValue({ versions: newVersions });
    setActiveLanguage(language);
    message.success(`已添加 ${SUPPORTED_LANGUAGES.find(l => l.value === language)?.label}`);
  };

  // 删除语言版本
  const handleRemoveLanguage = (language: string) => {
    if (versions.length === 1) {
      message.error('至少需要保留一个语言版本');
      return;
    }

    const newVersions = versions.filter(v => v.language !== language);
    setVersions(newVersions);
    form.setFieldsValue({ versions: newVersions });

    // 如果删除的是当前活动语言，切换到第一个
    if (activeLanguage === language) {
      setActiveLanguage(newVersions[0].language);
    }

    message.success('已删除该语言版本');
  };

  // 更新版本内容
  const handleContentChange = (language: string, content: string) => {
    const newVersions = versions.map(v =>
      v.language === language ? { ...v, content } : v
    );
    setVersions(newVersions);
    form.setFieldsValue({ versions: newVersions });
  };

  // 获取可添加的语言列表（排除已有的）
  const availableLanguages = SUPPORTED_LANGUAGES.filter(
    lang => !versions.some(v => v.language === lang.value)
  );

  // 生成 Tabs 项
  const tabItems = versions.map(version => ({
    key: version.language,
    label: (
      <Space>
        {SUPPORTED_LANGUAGES.find(l => l.value === version.language)?.label || version.language.toUpperCase()}
        {versions.length > 1 && (
          <DeleteOutlined
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveLanguage(version.language);
            }}
            style={{ color: '#ff4d4f', fontSize: '12px' }}
          />
        )}
      </Space>
    ),
    children: (
      <Form.Item
        name={['versions', versions.indexOf(version), 'content']}
        rules={[
          { required: true, message: '请输入模板内容' },
          { max: 5000, message: '模板内容不能超过5000个字符' },
        ]}
      >
        <TextArea
          ref={(ref) => {
            if (ref) textAreaRefs.current[version.language] = ref;
          }}
          value={version.content}
          onChange={(e) => handleContentChange(version.language, e.target.value)}
          placeholder={`输入 ${SUPPORTED_LANGUAGES.find(l => l.value === version.language)?.label} 模板内容，可以使用变量，例如: Hello {{username}}!...`}
          rows={40}
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            background: 'rgba(0, 0, 0, 0.02)',
          }}
        />
      </Form.Item>
    ),
  }));

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues || { versions: [{ language: 'en', content: '' }] }}
    >
      <Row gutter={24}>
        <Col xs={24} lg={18}>
          {/* 基本信息 */}
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

          {/* 多语言版本编辑 */}
          <Form.Item label="模板内容（多语言版本）">
            <Tabs
              activeKey={activeLanguage}
              onChange={setActiveLanguage}
              items={tabItems}
              tabBarExtraContent={
                availableLanguages.length > 0 && (
                  <Select
                    placeholder="添加语言版本"
                    style={{ width: 180 }}
                    onChange={handleAddLanguage}
                    value={undefined}
                    suffixIcon={<PlusOutlined />}
                  >
                    {availableLanguages.map(lang => (
                      <Select.Option key={lang.value} value={lang.value}>
                        {lang.label}
                      </Select.Option>
                    ))}
                  </Select>
                )
              }
            />
          </Form.Item>

          {/* 隐藏的 versions 字段，用于表单验证 */}
          <Form.Item name="versions" hidden>
            <Input />
          </Form.Item>
        </Col>

        <Col xs={24} lg={6}>
          <VariableHelper onInsert={handleInsertVariable} />
        </Col>
      </Row>
    </Form>
  );
};
