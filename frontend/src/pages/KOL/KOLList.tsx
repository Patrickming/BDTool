/**
 * KOL 列表页面
 */

import React, { useEffect, useState } from 'react';
import {
  Card,
  Input,
  Select,
  Button,
  Space,
  Row,
  Col,
  Form,
  InputNumber,
  Modal,
  message,
} from 'antd';
import { PlusOutlined, UploadOutlined, ReloadOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import KOLTable from '../../components/KOL/KOLTable';
import { useKOLStore } from '../../store/kol.store';
import {
  KOLStatusConfig,
  ContentCategoryConfig,
  LanguageConfig,
  SortByOptions,
  SortOrderOptions,
} from '../../types/kol';
import type { KOLQueryParams, CreateKOLDto } from '../../types/kol';
import { exportKOLsToCSV } from '../../utils/export';

const KOLList: React.FC = () => {
  const navigate = useNavigate();
  const { loading, fetchKOLs, queryParams, setQueryParams, resetQueryParams, createKOL, kols, pagination } = useKOLStore();
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 初始加载
  useEffect(() => {
    fetchKOLs();
  }, []);

  // 搜索
  const handleSearch = (values: any) => {
    const params: KOLQueryParams = {
      page: 1, // 重置到第一页
      ...queryParams,
      search: values.search || undefined,
      status: values.status || undefined,
      contentCategory: values.contentCategory || undefined,
      minQualityScore: values.minQualityScore || undefined,
      maxQualityScore: values.maxQualityScore || undefined,
      minFollowerCount: values.minFollowerCount || undefined,
      maxFollowerCount: values.maxFollowerCount || undefined,
      verified: values.verified !== undefined ? values.verified : undefined,
      sortBy: values.sortBy || 'createdAt',
      sortOrder: values.sortOrder || 'desc',
    };
    setQueryParams(params);
    fetchKOLs(params);
  };

  // 重置筛选
  const handleReset = () => {
    form.resetFields();
    resetQueryParams();
    fetchKOLs();
  };

  // 分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    const params = { ...queryParams, page, limit: pageSize };
    setQueryParams(params);
    fetchKOLs(params);
  };

  // 导出 KOL 列表
  const handleExport = () => {
    if (kols.length === 0) {
      message.warning('当前没有可导出的 KOL 数据');
      return;
    }

    try {
      exportKOLsToCSV(kols);
      message.success(`成功导出 ${kols.length} 个 KOL 数据`);
    } catch (error: any) {
      console.error('导出失败:', error);
      message.error('导出失败，请重试');
    }
  };

  // 创建 KOL
  const handleCreateKOL = async () => {
    try {
      console.log('开始验证表单...');
      const values = await createForm.validateFields();
      console.log('表单验证成功，原始值:', values);

      // 确保所有数值类型字段都被正确处理
      const data: CreateKOLDto = {
        username: values.username.replace(/^@/, ''), // 去除开头的@符号
        displayName: values.displayName,
        followerCount: values.followerCount !== undefined ? Number(values.followerCount) : 0,
        verified: values.verified !== undefined ? values.verified : false,
        language: values.language || 'en',
        qualityScore: values.qualityScore !== undefined ? Number(values.qualityScore) : 0,
        contentCategory: values.contentCategory || 'unknown',
        status: values.status || 'new',
        customNotes: values.customNotes,
      };

      console.log('准备发送的数据:', data);
      console.log('质量分字段检查:', {
        raw: values.qualityScore,
        converted: Number(values.qualityScore),
        final: data.qualityScore
      });

      const result = await createKOL(data);
      console.log('创建成功，结果:', result);

      setCreateModalOpen(false);
      createForm.resetFields();
    } catch (error: any) {
      console.error('创建 KOL 失败:', error);
      console.error('错误详情:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      message.error(error.response?.data?.message || error.message || '创建失败');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* 页面头部 */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>KOL 管理</h1>
        </Col>
        <Col>
          <Space>
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={kols.length === 0}
            >
              导出 Excel ({pagination?.total || 0})
            </Button>
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => navigate('/kols/import')}
            >
              批量导入
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              创建 KOL
            </Button>
          </Space>
        </Col>
      </Row>

      {/* 搜索和筛选 */}
      <Card style={{ marginBottom: '24px' }}>
        <Form form={form} onFinish={handleSearch} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="search" label="搜索">
                <Input
                  placeholder="用户名或显示名"
                  prefix={<SearchOutlined />}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="status" label="状态">
                <Select placeholder="选择状态" allowClear>
                  {Object.entries(KOLStatusConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item name="contentCategory" label="内容分类">
                <Select placeholder="选择分类" allowClear>
                  {Object.entries(ContentCategoryConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="minFollowerCount" label="最小粉丝数">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="0"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="maxFollowerCount" label="最大粉丝数">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="无限制"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="minQualityScore" label="最小质量分">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  placeholder="0"
                />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="maxQualityScore" label="最大质量分">
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  placeholder="100"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="verified" label="认证状态">
                <Select placeholder="全部" allowClear>
                  <Select.Option value={true}>已认证</Select.Option>
                  <Select.Option value={false}>未认证</Select.Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="sortBy" label="排序字段" initialValue="createdAt">
                <Select>
                  {SortByOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item name="sortOrder" label="排序方向" initialValue="desc">
                <Select>
                  {SortOrderOptions.map((option) => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Form.Item style={{ marginBottom: 0, width: '100%' }}>
                <Space style={{ width: '100%' }}>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* KOL 表格 */}
      <Card>
        <KOLTable loading={loading} onChange={handleTableChange} />
      </Card>

      {/* 创建 KOL 模态框 */}
      <Modal
        title="创建 KOL"
        open={createModalOpen}
        onOk={handleCreateKOL}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        width={600}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="username"
            label="用户ID"
            rules={[
              { required: true, message: '请输入用户ID' },
              { pattern: /^@?[a-zA-Z0-9_]{1,15}$/, message: '用户ID只能包含字母、数字和下划线，1-15个字符' }
            ]}
          >
            <Input placeholder="输入 Twitter 用户ID（可带 @）" />
          </Form.Item>

          <Form.Item
            name="displayName"
            label="用户名称"
            rules={[{ required: true, message: '请输入用户名称' }]}
          >
            <Input placeholder="KOL 的用户名称" />
          </Form.Item>

          <Form.Item name="followerCount" label="粉丝数">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="粉丝数量" />
          </Form.Item>

          <Form.Item name="verified" label="认证状态">
            <Select placeholder="选择认证状态">
              <Select.Option value={true}>已认证 ✓</Select.Option>
              <Select.Option value={false}>未认证</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select placeholder="选择状态">
              {Object.entries(KOLStatusConfig).map(([value, config]) => (
                <Select.Option key={value} value={value}>
                  {config.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="contentCategory" label="内容分类">
            <Select placeholder="选择分类">
              {Object.entries(ContentCategoryConfig).map(([value, config]) => (
                <Select.Option key={value} value={value}>
                  {config.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="language" label="语言" initialValue="en">
            <Select placeholder="选择语言">
              {Object.entries(LanguageConfig).map(([value, config]) => (
                <Select.Option key={value} value={value}>
                  {config.flag} {config.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="qualityScore"
            label="质量分"
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="0-100" />
          </Form.Item>

          <Form.Item name="customNotes" label="备注">
            <Input.TextArea rows={3} maxLength={1000} showCount placeholder="添加自定义备注" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KOLList;
