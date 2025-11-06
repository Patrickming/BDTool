/**
 * KOL 详情页面
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Space, Spin, Tag, Divider, Avatar, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TwitterOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import Navbar from '@/components/Navbar';
import KOLStatusBadge from '@/components/KOL/KOLStatusBadge';
import QualityScoreBar from '@/components/KOL/QualityScoreBar';
import { kolService } from '@/services/kol.service';
import type { KOL } from '@/types/kol';
import { ContentCategoryConfig } from '@/types/kol';

const KOLDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [kol, setKol] = useState<KOL | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadKOLDetail(parseInt(id));
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

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!kol) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <div style={{ maxWidth: 1200, margin: '40px auto', padding: '0 20px' }}>
          <Card>
            <p>KOL 不存在</p>
            <Button onClick={() => navigate('/kols')}>返回列表</Button>
          </Card>
        </div>
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
        {/* 顶部操作栏 */}
        <div style={{ marginBottom: 24 }}>
          <Space>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/kols')}
            >
              返回列表
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => navigate(`/kols/${kol.id}/edit`)}
            >
              编辑
            </Button>
          </Space>
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
                <Col span={8}>
                  <Statistic
                    title="粉丝数"
                    value={kol.followerCount}
                    formatter={formatNumber}
                    valueStyle={{ color: 'var(--brand-primary)' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="关注数"
                    value={kol.followingCount}
                    formatter={formatNumber}
                  />
                </Col>
                <Col span={8}>
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

        {/* 联系记录卡片（占位） */}
        <Card
          title="联系记录"
          extra={
            <Button type="link" disabled>
              添加记录
            </Button>
          }
        >
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
            <CalendarOutlined style={{ fontSize: 48, marginBottom: 16 }} />
            <p>暂无联系记录</p>
            <p style={{ fontSize: 12 }}>此功能将在后续版本中实现</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default KOLDetail;
