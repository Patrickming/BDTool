/**
 * KOL 表格组件
 */

import React, { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, InputNumber, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import type { KOL, UpdateKOLDto, KOLStatus, ContentCategory, KOLLanguage, Pagination } from '../../types/kol';
import { KOLStatusConfig, ContentCategoryConfig, LanguageConfig } from '../../types/kol';
import KOLStatusBadge from './KOLStatusBadge';
import QualityScoreBar from './QualityScoreBar';
import { useKOLStore } from '../../store/kol.store';

interface KOLTableProps {
  loading?: boolean;
  onChange?: (page: number, pageSize: number) => void;
}

const KOLTable: React.FC<KOLTableProps> = ({ loading = false, onChange }) => {
  const navigate = useNavigate();
  const { kols, pagination, updateKOL, deleteKOL } = useKOLStore();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingKOL, setEditingKOL] = useState<KOL | null>(null);
  const [form] = Form.useForm();

  // 打开编辑模态框
  const handleEdit = (kol: KOL) => {
    setEditingKOL(kol);
    form.setFieldsValue(kol);
    setEditModalOpen(true);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingKOL) return;

    try {
      const values = await form.validateFields();
      const data: UpdateKOLDto = {
        username: values.username.replace(/^@/, ''), // 去除开头的@符号
        displayName: values.displayName,
        status: values.status,
        contentCategory: values.contentCategory,
        language: values.language,
        qualityScore: values.qualityScore,
        followerCount: values.followerCount,
        verified: values.verified,
        customNotes: values.customNotes,
      };

      await updateKOL(editingKOL.id, data);
      setEditModalOpen(false);
      setEditingKOL(null);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 删除 KOL
  const handleDelete = async (id: number) => {
    await deleteKOL(id);
  };

  // 查看详情
  const handleViewDetail = (id: number) => {
    navigate(`/kols/${id}`);
  };

  // 表格列定义
  const columns: ColumnsType<KOL> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用户ID',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      render: (username: string) => (
        <a
          href={`https://twitter.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          @{username}
        </a>
      ),
    },
    {
      title: '用户名称',
      dataIndex: 'displayName',
      key: 'displayName',
      width: 150,
    },
    {
      title: '粉丝数',
      dataIndex: 'followerCount',
      key: 'followerCount',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      width: 100,
      render: (language: KOLLanguage) => {
        const config = LanguageConfig[language];
        return config ? `${config.flag} ${config.label}` : language;
      },
    },
    {
      title: '质量分',
      dataIndex: 'qualityScore',
      key: 'qualityScore',
      width: 150,
      render: (score: number) => <QualityScoreBar score={score} size="small" />,
    },
    {
      title: '内容分类',
      dataIndex: 'contentCategory',
      key: 'contentCategory',
      width: 120,
      render: (category: ContentCategory) =>
        ContentCategoryConfig[category]?.label || '未知',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: KOLStatus) => <KOLStatusBadge status={status} />,
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<UserOutlined />}
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此 KOL 吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={kols}
        loading={loading}
        rowKey="id"
        pagination={
          pagination
            ? {
                current: pagination.page,
                pageSize: pagination.limit,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: onChange,
              }
            : false
        }
        scroll={{ x: 1200 }}
      />

      {/* 编辑模态框 */}
      <Modal
        title={
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ✏️ 编辑 KOL 信息
          </div>
        }
        open={editModalOpen}
        onOk={handleSaveEdit}
        onCancel={() => {
          setEditModalOpen(false);
          setEditingKOL(null);
          form.resetFields();
        }}
        width={750}
        okText="保存"
        cancelText="取消"
        centered
        styles={{
          body: {
            paddingTop: 24,
            maxHeight: '70vh',
            overflowY: 'auto',
          }
        }}
      >
        <Form form={form} layout="vertical">
          {/* 第一行：基本信息 */}
          <div style={{
            marginBottom: 16,
            padding: 16,
            background: 'rgba(102, 126, 234, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(102, 126, 234, 0.15)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: 12,
              color: '#667eea'
            }}>
              📋 基本信息
            </div>
            <Space direction="vertical" size={0} style={{ width: '100%' }}>
              <Space size={16} style={{ width: '100%' }}>
                <Form.Item
                  name="username"
                  label="用户ID"
                  rules={[
                    { required: true, message: '请输入用户ID' },
                    { pattern: /^@?[a-zA-Z0-9_]{1,15}$/, message: '用户ID只能包含字母、数字和下划线，1-15个字符' }
                  ]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input placeholder="Twitter 用户ID" prefix="@" />
                </Form.Item>

                <Form.Item
                  name="displayName"
                  label="显示名称"
                  rules={[{ required: true, message: '请输入显示名称' }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input placeholder="KOL 显示名称" />
                </Form.Item>
              </Space>
            </Space>
          </div>

          {/* 第二行：数据指标 */}
          <div style={{
            marginBottom: 16,
            padding: 16,
            background: 'rgba(20, 241, 149, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(20, 241, 149, 0.15)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: 12,
              color: '#14F195'
            }}>
              📊 数据指标
            </div>
            <Space size={16} style={{ width: '100%' }}>
              <Form.Item
                name="followerCount"
                label="粉丝数"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  style={{ width: '100%' }}
                  placeholder="0"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                name="qualityScore"
                label="质量分"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="0-100"
                  formatter={(value) => `${value}分`}
                  parser={(value) => value?.replace('分', '') as any}
                />
              </Form.Item>

              <Form.Item
                name="verified"
                label="认证状态"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select placeholder="选择认证状态">
                  <Select.Option value={true}>✓ 已认证</Select.Option>
                  <Select.Option value={false}>未认证</Select.Option>
                </Select>
              </Form.Item>
            </Space>
          </div>

          {/* 第三行：分类信息 */}
          <div style={{
            marginBottom: 16,
            padding: 16,
            background: 'rgba(255, 107, 107, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(255, 107, 107, 0.15)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: 12,
              color: '#ff6b6b'
            }}>
              🏷️ 分类信息
            </div>
            <Space size={16} style={{ width: '100%' }}>
              <Form.Item
                name="status"
                label="状态"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select placeholder="选择状态">
                  {Object.entries(KOLStatusConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="contentCategory"
                label="内容分类"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select placeholder="选择分类">
                  {Object.entries(ContentCategoryConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="language"
                label="语言"
                style={{ flex: 1, marginBottom: 0 }}
              >
                <Select placeholder="选择语言">
                  {Object.entries(LanguageConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.flag} {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Space>
          </div>

          {/* 第四行：备注 */}
          <div style={{
            padding: 16,
            background: 'rgba(158, 158, 158, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(158, 158, 158, 0.15)'
          }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: 12,
              color: '#9e9e9e'
            }}>
              📝 备注信息
            </div>
            <Form.Item name="customNotes" style={{ marginBottom: 0 }}>
              <Input.TextArea
                rows={3}
                maxLength={1000}
                showCount
                placeholder="添加自定义备注..."
                style={{ resize: 'none' }}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default KOLTable;
