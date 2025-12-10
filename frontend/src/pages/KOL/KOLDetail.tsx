/**
 * KOL 详情页面
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Spin, Tag, Divider, Avatar, Row, Col, Statistic, Table, Empty } from 'antd';
import { ArrowLeftOutlined, TwitterOutlined, UserOutlined, HistoryOutlined, CalendarOutlined } from '@ant-design/icons';
import KOLStatusBadge from '@/components/KOL/KOLStatusBadge';
import QualityScoreBar from '@/components/KOL/QualityScoreBar';
import { kolService } from '@/services/kol.service';
import type { KOL } from '@/types/kol';
import { ContentCategoryConfig } from '@/types/kol';
import type { ColumnsType } from 'antd/es/table';

// 历史记录类型
interface KOLHistoryRecord {
  id: number;
  fieldName: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
}

// 字段名称映射
const fieldNameMap: Record<string, string> = {
  status: '状态',
  customNotes: '备注',
  qualityScore: '质量评分',
  contentCategory: '内容分类',
  language: '语言',
  followerCount: '粉丝数',
  followingCount: '关注数',
  bio: '简介',
  displayName: '显示名称',
  username: '用户名',
  verified: '认证状态',
  profileImgUrl: '头像',
};

// 状态值映射
const statusValueMap: Record<string, string> = {
  new: '新添加',
  contacted: '已联系',
  replied: '已回复',
  negotiating: '洽谈中',
  cooperating: '合作中',
  cooperated: '已合作',
  rejected: '已拒绝',
};

const KOLDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kol, setKol] = useState<KOL | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<KOLHistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadKOLDetail(parseInt(id));
      loadKOLHistory(parseInt(id));
    }
  }, [id]);

  const loadKOLDetail = async (kolId: number) => {
    try {
      setLoading(true);
      const data = await kolService.getKOLById(kolId);
      setKol(data);
    } catch (error) {
      console.error('加载 KOL 详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadKOLHistory = async (kolId: number) => {
    try {
      setHistoryLoading(true);
      const data = await kolService.getKOLHistory(kolId);
      setHistory(data);
    } catch (error) {
      console.error('加载 KOL 历史记录失败:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 格式化历史记录的值
  const formatHistoryValue = (fieldName: string, value: string | null): string => {
    if (value === null) return '-';

    try {
      const parsed = JSON.parse(value);

      // 状态字段特殊处理
      if (fieldName === 'status') {
        return statusValueMap[parsed] || parsed;
      }

      // 布尔值处理
      if (typeof parsed === 'boolean') {
        return parsed ? '是' : '否';
      }

      // 内容分类处理
      if (fieldName === 'contentCategory') {
        return ContentCategoryConfig[parsed]?.label || parsed;
      }

      return String(parsed);
    } catch {
      return value;
    }
  };

  // 历史记录表格列定义
  const historyColumns: ColumnsType<KOLHistoryRecord> = [
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '修改字段',
      dataIndex: 'fieldName',
      key: 'fieldName',
      width: 120,
      render: (fieldName: string) => fieldNameMap[fieldName] || fieldName,
    },
    {
      title: '原值',
      dataIndex: 'oldValue',
      key: 'oldValue',
      render: (value: string | null, record) => formatHistoryValue(record.fieldName, value),
    },
    {
      title: '新值',
      dataIndex: 'newValue',
      key: 'newValue',
      render: (value: string | null, record) => formatHistoryValue(record.fieldName, value),
    },
  ];

  if (loading) {
    return (
      <div style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!kol) {
    return (
      <div className="animate-fade-in-up">
        <Card>
          <p>KOL 不存在</p>
          <Button onClick={() => navigate('/kols')}>返回列表</Button>
        </Card>
      </div>
    );
  }

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN');
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN');
  };

  return (
    <div className="animate-fade-in-up">
        {/* 顶部操作栏 */}
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/kols')}
          >
            返回列表
          </Button>
        </div>

        {/* 基本信息卡片 */}
        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[24, 24]}>
            {/* 左侧：头像和基本信息 */}
            <Col xs={24} md={8}>
              <div style={{ textAlign: 'center' }}>
                <Avatar
                  size={120}
                  src={kol.profileImgUrl}
                  icon={<UserOutlined />}
                  style={{ marginBottom: 16 }}
                />
                <h2 style={{ marginBottom: 8 }}>
                  {kol.displayName}
                  {kol.verified && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      ✓ 已认证
                    </Tag>
                  )}
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
                  <a
                    href={`https://twitter.com/${kol.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--brand-primary)' }}
                  >
                    <TwitterOutlined /> @{kol.username}
                  </a>
                </p>
                <KOLStatusBadge status={kol.status} />
              </div>
            </Col>

            {/* 右侧：统计数据 */}
            <Col xs={24} md={16}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="粉丝数"
                    value={kol.followerCount}
                    formatter={formatNumber}
                    valueStyle={{ color: 'var(--brand-primary)' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="质量评分"
                    value={kol.qualityScore}
                    suffix="/ 100"
                    valueStyle={{ color: kol.qualityScore >= 70 ? '#52c41a' : kol.qualityScore >= 40 ? '#faad14' : '#ff4d4f' }}
                  />
                </Col>
              </Row>

              <Divider />

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ marginBottom: 8 }}>质量评分</h4>
                <QualityScoreBar score={kol.qualityScore} size="large" showLabel />
              </div>
            </Col>
          </Row>
        </Card>

        {/* 详细信息卡片 */}
        <Card title="详细信息" style={{ marginBottom: 24 }}>
          <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered>
            <Descriptions.Item label="用户序号">#{kol.id}</Descriptions.Item>
            <Descriptions.Item label="用户ID">@{kol.username}</Descriptions.Item>

            <Descriptions.Item label="用户名称">{kol.displayName}</Descriptions.Item>
            <Descriptions.Item label="内容分类">
              {ContentCategoryConfig[kol.contentCategory]?.label || '未知'}
            </Descriptions.Item>

            <Descriptions.Item label="状态">
              <KOLStatusBadge status={kol.status} />
            </Descriptions.Item>
            <Descriptions.Item label="认证状态">
              {kol.verified ? '✓ 已认证' : '未认证'}
            </Descriptions.Item>

            <Descriptions.Item label="添加时间">
              {formatDate(kol.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {formatDate(kol.updatedAt)}
            </Descriptions.Item>

            {kol.customNotes && (
              <Descriptions.Item label="备注" span={2}>
                {kol.customNotes}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 个人简介卡片 */}
        {kol.bio && (
          <Card title="个人简介" style={{ marginBottom: 24 }}>
            <p style={{ margin: 0, lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
              {kol.bio}
            </p>
          </Card>
        )}

        {/* 修改历史卡片 */}
        <Card
          title={
            <Space>
              <HistoryOutlined />
              修改历史
            </Space>
          }
        >
          {historyLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin />
            </div>
          ) : history.length > 0 ? (
            <Table
              columns={historyColumns}
              dataSource={history}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: false,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              size="small"
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无修改记录"
            />
          )}
        </Card>
    </div>
  );
};

export default KOLDetail;
