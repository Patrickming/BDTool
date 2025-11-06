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
} from 'antd';
import { PlusOutlined, UploadOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import KOLTable from '../../components/KOL/KOLTable';
import { useKOLStore } from '../../store/kol.store';
import {
  KOLStatusConfig,
  ContentCategoryConfig,
  SortByOptions,
  SortOrderOptions,
} from '../../types/kol';
import type { KOLQueryParams } from '../../types/kol';

const KOLList: React.FC = () => {
  const navigate = useNavigate();
  const { loading, fetchKOLs, queryParams, setQueryParams, resetQueryParams } = useKOLStore();
  const [form] = Form.useForm();

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
      verified: values.verified || undefined,
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
    fetchKOLs(queryParams);
  };

  // 分页变化
  const handleTableChange = (page: number, pageSize: number) => {
    const params = { ...queryParams, page, limit: pageSize };
    setQueryParams(params);
    fetchKOLs(params);
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
              icon={<UploadOutlined />}
              onClick={() => navigate('/kols/import')}
            >
              批量导入
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/kols/create')}
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
    </div>
  );
};

export default KOLList;
