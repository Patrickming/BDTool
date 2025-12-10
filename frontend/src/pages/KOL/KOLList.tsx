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
import { PlusOutlined, UploadOutlined, ReloadOutlined, SearchOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
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
import type { KOLQueryParams, CreateKOLDto, UpdateKOLDto } from '../../types/kol';
import { exportKOLsToCSV } from '../../utils/export';
import { kolService } from '../../services/kol.service';

const KOLList: React.FC = () => {
  const navigate = useNavigate();
  const { loading, fetchKOLs, queryParams, setQueryParams, resetQueryParams, createKOL, updateKOL, kols, pagination } = useKOLStore();
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [batchEditForm] = Form.useForm();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [batchEditModalOpen, setBatchEditModalOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  // 导出 KOL 列表 - 导出所有筛选结果
  const handleExport = async () => {
    const totalCount = pagination?.total || 0;

    if (totalCount === 0) {
      message.warning('当前没有可导出的 KOL 数据');
      return;
    }

    // 显示确认对话框
    Modal.confirm({
      title: '确认导出',
      content: `即将导出 ${totalCount} 个 KOL 数据，确认继续？`,
      okText: '确认导出',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 使用当前筛选条件，但获取所有数据（设置一个很大的 limit）
          const exportParams = {
            ...queryParams,
            page: 1,
            limit: 5000, // 后端最大限制为5000
          };

          // 获取所有筛选的 KOL 数据
          const response = await kolService.getKOLList(exportParams);
          const allKols = response.kols;

          if (allKols.length === 0) {
            message.warning('没有可导出的数据');
            return;
          }

          // 导出所有筛选的 KOL
          exportKOLsToCSV(allKols);
          message.success(`成功导出 ${allKols.length} 个 KOL 数据`);
        } catch (error: any) {
          console.error('导出失败:', error);
          message.error('导出失败，请重试');
        }
      },
    });
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

  // 批量修改 KOL
  const handleBatchEdit = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要修改的 KOL');
      return;
    }

    try {
      const values = await batchEditForm.validateFields();

      // 只提取用户填写的字段
      const updateData: Partial<UpdateKOLDto> = {};
      if (values.status !== undefined) updateData.status = values.status;
      if (values.contentCategory !== undefined) updateData.contentCategory = values.contentCategory;
      if (values.language !== undefined) updateData.language = values.language;
      if (values.qualityScore !== undefined) updateData.qualityScore = Number(values.qualityScore);
      if (values.verified !== undefined) updateData.verified = values.verified;

      if (Object.keys(updateData).length === 0) {
        message.warning('请至少选择一个要修改的字段');
        return;
      }

      // 批量更新
      const promises = selectedRowKeys.map((id) => updateKOL(Number(id), updateData as UpdateKOLDto));
      await Promise.all(promises);

      message.success(`成功修改 ${selectedRowKeys.length} 个 KOL`);
      setBatchEditModalOpen(false);
      batchEditForm.resetFields();
      setSelectedRowKeys([]);
      fetchKOLs();
    } catch (error: any) {
      console.error('批量修改失败:', error);
      message.error(error.response?.data?.message || error.message || '批量修改失败');
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
            {selectedRowKeys.length > 0 && (
              <Button
                type="default"
                icon={<EditOutlined />}
                onClick={() => setBatchEditModalOpen(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                }}
              >
                批量修改 ({selectedRowKeys.length})
              </Button>
            )}
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
      <Card
        style={{
          marginBottom: '24px',
          background: 'rgba(153, 69, 255, 0.03)',
          border: '1px solid rgba(153, 69, 255, 0.15)',
        }}
      >
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: 16,
          color: '#667eea',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🔍 筛选条件
        </div>

        <Form form={form} onFinish={handleSearch} layout="vertical">
          {/* 第一行：基础筛选 */}
          <div style={{
            marginBottom: 12,
            padding: 16,
            background: 'rgba(102, 126, 234, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(102, 126, 234, 0.1)'
          }}>
            <Row gutter={12}>
              <Col span={8}>
                <Form.Item name="search" label="🔎 搜索" style={{ marginBottom: 0 }}>
                  <Input
                    placeholder="输入用户名或显示名..."
                    prefix={<SearchOutlined />}
                    allowClear
                    size="middle"
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="status" label="📊 状态" style={{ marginBottom: 0 }}>
                  <Select placeholder="全部状态" allowClear size="middle">
                    {Object.entries(KOLStatusConfig).map(([value, config]) => (
                      <Select.Option key={value} value={value}>
                        {config.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item name="contentCategory" label="🏷️ 内容分类" style={{ marginBottom: 0 }}>
                  <Select placeholder="全部分类" allowClear size="middle">
                    {Object.entries(ContentCategoryConfig).map(([value, config]) => (
                      <Select.Option key={value} value={value}>
                        {config.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* 第二行：粉丝数和质量分范围 */}
          <div style={{
            marginBottom: 12,
            padding: 16,
            background: 'rgba(20, 241, 149, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(20, 241, 149, 0.1)'
          }}>
            <Row gutter={12}>
              <Col span={6}>
                <Form.Item name="minFollowerCount" label="👥 最小粉丝数" style={{ marginBottom: 0 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="0"
                    size="middle"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="maxFollowerCount" label="👥 最大粉丝数" style={{ marginBottom: 0 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    placeholder="无限制"
                    size="middle"
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="minQualityScore" label="⭐ 最小质量分" style={{ marginBottom: 0 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    placeholder="0"
                    size="middle"
                  />
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="maxQualityScore" label="⭐ 最大质量分" style={{ marginBottom: 0 }}>
                  <InputNumber
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    placeholder="100"
                    size="middle"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* 第三行：排序和操作 */}
          <div style={{
            padding: 16,
            background: 'rgba(255, 107, 107, 0.05)',
            borderRadius: 8,
            border: '1px solid rgba(255, 107, 107, 0.1)'
          }}>
            <Row gutter={12} align="bottom">
              <Col span={6}>
                <Form.Item name="verified" label="✓ 认证状态" style={{ marginBottom: 0 }}>
                  <Select placeholder="全部" allowClear size="middle">
                    <Select.Option value={true}>✓ 已认证</Select.Option>
                    <Select.Option value={false}>未认证</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="sortBy" label="📈 排序字段" initialValue="createdAt" style={{ marginBottom: 0 }}>
                  <Select size="middle">
                    {SortByOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Form.Item name="sortOrder" label="↕️ 排序方向" initialValue="desc" style={{ marginBottom: 0 }}>
                  <Select size="middle">
                    {SortOrderOptions.map((option) => (
                      <Select.Option key={option.value} value={option.value}>
                        {option.label}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col span={6}>
                <Space style={{ width: '100%' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    size="middle"
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                    }}
                  >
                    搜索
                  </Button>
                  <Button
                    onClick={handleReset}
                    icon={<ReloadOutlined />}
                    size="middle"
                  >
                    重置
                  </Button>
                </Space>
              </Col>
            </Row>
          </div>
        </Form>
      </Card>

      {/* KOL 表格 */}
      <Card>
        {/* 批量操作工具栏 */}
        {selectedRowKeys.length > 0 && (
          <div style={{
            marginBottom: 16,
            padding: 16,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: 8,
            border: '2px solid #667eea',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#667eea'
              }}>
                ✓ 已选择 <span style={{ color: '#14F195', fontSize: '18px' }}>{selectedRowKeys.length}</span> 个 KOL
              </div>
              <Button
                size="small"
                onClick={() => setSelectedRowKeys([])}
                style={{ color: '#999' }}
              >
                取消选择
              </Button>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setBatchEditModalOpen(true)}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                }}
              >
                批量修改
              </Button>
            </Space>
          </div>
        )}

        <KOLTable
          loading={loading}
          onChange={handleTableChange}
          selectedRowKeys={selectedRowKeys}
          onSelectionChange={setSelectedRowKeys}
        />
      </Card>

      {/* 创建 KOL 模态框 */}
      <Modal
        title={
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #14F195 0%, #667eea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ➕ 创建新 KOL
          </div>
        }
        open={createModalOpen}
        onOk={handleCreateKOL}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        width={750}
        okText="创建"
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
        <Form form={createForm} layout="vertical">
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
                initialValue="en"
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

      {/* 批量修改模态框 */}
      <Modal
        title={
          <div style={{
            fontSize: '18px',
            fontWeight: 600,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            ✏️ 批量修改 KOL ({selectedRowKeys.length} 个)
          </div>
        }
        open={batchEditModalOpen}
        onOk={handleBatchEdit}
        onCancel={() => {
          setBatchEditModalOpen(false);
          batchEditForm.resetFields();
        }}
        width={650}
        okText="保存修改"
        cancelText="取消"
        centered
      >
        <div style={{ marginBottom: 16, padding: 12, background: '#fff3cd', borderRadius: 6, color: '#856404' }}>
          ⚠️ 提示：只填写需要修改的字段，未填写的字段将保持不变
        </div>

        <Form form={batchEditForm} layout="vertical">
          <div style={{
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
              🏷️ 批量修改字段
            </div>

            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Form.Item name="status" label="状态" style={{ marginBottom: 0 }}>
                <Select placeholder="保持不变" allowClear>
                  {Object.entries(KOLStatusConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="contentCategory" label="内容分类" style={{ marginBottom: 0 }}>
                <Select placeholder="保持不变" allowClear>
                  {Object.entries(ContentCategoryConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="language" label="语言" style={{ marginBottom: 0 }}>
                <Select placeholder="保持不变" allowClear>
                  {Object.entries(LanguageConfig).map(([value, config]) => (
                    <Select.Option key={value} value={value}>
                      {config.flag} {config.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="qualityScore" label="质量分" style={{ marginBottom: 0 }}>
                <InputNumber
                  min={0}
                  max={100}
                  style={{ width: '100%' }}
                  placeholder="保持不变"
                  formatter={(value) => value ? `${value}分` : ''}
                  parser={(value) => value?.replace('分', '') as any}
                />
              </Form.Item>

              <Form.Item name="verified" label="认证状态" style={{ marginBottom: 0 }}>
                <Select placeholder="保持不变" allowClear>
                  <Select.Option value={true}>✓ 已认证</Select.Option>
                  <Select.Option value={false}>未认证</Select.Option>
                </Select>
              </Form.Item>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default KOLList;
