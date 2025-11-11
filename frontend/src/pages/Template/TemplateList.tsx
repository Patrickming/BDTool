/**
 * 模板列表页面
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Row,
  Col,
  Modal,
  Typography,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CopyOutlined,
  UpOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useTemplateStore } from '@/store/template.store';
import { TemplateCategoryBadge } from '@/components/Template/TemplateCategoryBadge';
import { TemplateCopyModal } from '@/components/Template/TemplateCopyModal';
import { TEMPLATE_CATEGORY_CONFIG, type Template } from '@/types/template';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export const TemplateList: React.FC = () => {
  const navigate = useNavigate();
  const {
    templates,
    loading,
    pagination,
    queryParams,
    fetchTemplates,
    deleteTemplate,
    reorderTemplate,
    setQueryParams,
  } = useTemplateStore();

  // 复制对话框状态
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, [queryParams]);

  const handleCopy = (template: Template) => {
    setSelectedTemplate(template);
    setCopyModalOpen(true);
  };

  const handleDelete = (template: Template) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除模板 "${template.name}" 吗？此操作不可恢复。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => deleteTemplate(template.id),
    });
  };

  const handleMoveUp = async (template: Template) => {
    await reorderTemplate(template.id, 'up');
  };

  const handleMoveDown = async (template: Template) => {
    await reorderTemplate(template.id, 'down');
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (name: string) => (
        <Text strong style={{ fontSize: '14px' }}>
          {name}
        </Text>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (category: any) => <TemplateCategoryBadge category={category} />,
    },
    {
      title: '语言版本',
      dataIndex: 'versions',
      key: 'versions',
      width: 150,
      render: (versions: any[]) => (
        <Space size={4}>
          {versions?.map((v) => (
            <Tag key={v.language}>{v.language.toUpperCase()}</Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '内容预览',
      dataIndex: 'versions',
      key: 'content',
      ellipsis: true,
      render: (versions: any[]) => {
        const firstVersion = versions?.[0];
        const content = firstVersion?.content || '';
        return (
          <Text type="secondary" style={{ fontSize: '13px' }}>
            {content.substring(0, 80)}
            {content.length > 80 && '...'}
          </Text>
        );
      },
    },
    {
      title: '排序',
      key: 'order',
      width: 80,
      align: 'center' as const,
      render: (_: any, record: Template, index: number) => (
        <Space direction="vertical" size={0}>
          <Button
            type="text"
            size="small"
            icon={<UpOutlined />}
            onClick={() => handleMoveUp(record)}
            disabled={index === 0}
            style={{ padding: '0 4px' }}
          />
          <Button
            type="text"
            size="small"
            icon={<DownOutlined />}
            onClick={() => handleMoveDown(record)}
            disabled={index === templates.length - 1}
            style={{ padding: '0 4px' }}
          />
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: Template) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<CopyOutlined />}
            onClick={() => handleCopy(record)}
            style={{ color: '#14F195' }}
          >
            复制
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/templates/${record.id}/edit`)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        className="animate-fade-in-up"
        style={{
          background: 'rgba(153, 69, 255, 0.05)',
          border: '1px solid rgba(153, 69, 255, 0.2)',
        }}
      >
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              📝 模板管理
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/templates/create')}
              className="hover-lift"
            >
              创建模板
            </Button>
          </Col>
        </Row>

        {/* 筛选区域 */}
        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="搜索模板名称或内容..."
              prefix={<SearchOutlined />}
              value={queryParams.search}
              onChange={(e) => setQueryParams({ search: e.target.value })}
              allowClear
              size="large"
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="选择分类"
              value={queryParams.category}
              onChange={(value) => setQueryParams({ category: value })}
              allowClear
              size="large"
              style={{ width: '100%' }}
            >
              {Object.entries(TEMPLATE_CATEGORY_CONFIG).map(([key, config]) => (
                <Select.Option key={key} value={key}>
                  <span style={{ marginRight: '8px' }}>{config.icon}</span>
                  {config.label}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="排序方式"
              value={queryParams.sortBy}
              onChange={(value) => setQueryParams({ sortBy: value })}
              size="large"
              style={{ width: '100%' }}
            >
              <Select.Option value="displayOrder">自定义排序</Select.Option>
              <Select.Option value="createdAt">创建时间</Select.Option>
              <Select.Option value="updatedAt">更新时间</Select.Option>
              <Select.Option value="useCount">使用次数</Select.Option>
              <Select.Option value="name">名称</Select.Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={5}>
            <Select
              placeholder="排序方向"
              value={queryParams.sortOrder}
              onChange={(value) => setQueryParams({ sortOrder: value })}
              size="large"
              style={{ width: '100%' }}
            >
              <Select.Option value="desc">降序</Select.Option>
              <Select.Option value="asc">升序</Select.Option>
            </Select>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={templates}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.limit,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) =>
              setQueryParams({ page, limit: pageSize }),
          }}
        />
      </Card>

      {/* 复制对话框 */}
      <TemplateCopyModal
        open={copyModalOpen}
        template={selectedTemplate}
        onClose={() => setCopyModalOpen(false)}
      />
    </div>
  );
};
