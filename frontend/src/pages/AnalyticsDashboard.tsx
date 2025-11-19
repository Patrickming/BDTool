/**
 * 分析仪表盘页面
 */

import React, { useEffect } from "react";
import { Row, Col, Button, Select, Space } from "antd";
import {
  ReloadOutlined,
  TeamOutlined,
  UserAddOutlined,
  PhoneOutlined,
  PercentageOutlined,
  StarOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useAnalyticsStore } from "../store/analytics.store";
import { StatCard } from "../components/analytics/StatCard";
import { FollowerDistributionChart } from "../components/analytics/FollowerDistributionChart";
import { QualityScoreChart } from "../components/analytics/QualityScoreChart";
import { ContentCategoryChart } from "../components/analytics/ContentCategoryChart";
import { StatusDistributionChart } from "../components/analytics/StatusDistributionChart";
import { LanguageDistributionChart } from "../components/analytics/LanguageDistributionChart";
import { TemplateCategoryChart } from "../components/analytics/TemplateCategoryChart";
import { ContactTimelineChart } from "../components/analytics/ContactTimelineChart";

const { Option } = Select;

export const AnalyticsDashboard: React.FC = () => {
  const {
    overviewStats,
    kolDistributions,
    templateEffectiveness,
    contactTimeline,
    loadingOverview,
    loadingDistributions,
    loadingTemplates,
    loadingTimeline,
    timelineDays,
    fetchAllAnalytics,
    fetchContactTimeline,
    setTimelineDays,
  } = useAnalyticsStore();

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  const handleRefresh = () => {
    fetchAllAnalytics();
  };

  const handleTimelineDaysChange = async (days: number) => {
    setTimelineDays(days);
    // 同时更新概览统计和时间线数据
    await Promise.all([
      useAnalyticsStore.getState().fetchOverviewStats(days),
      fetchContactTimeline(days),
    ]);
  };

  // 根据时间范围生成标题前缀
  const getTimeRangeLabel = () => {
    if (timelineDays === 7) return "本周";
    if (timelineDays === 30) return "本月";
    return `近${timelineDays}天`;
  };

  return (
    <div style={{ padding: "24px", background: "#0a0a0f", minHeight: "100vh" }}>
      {/* 页面标题和操作 */}
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ color: "#fff", fontSize: "28px", margin: 0 }}>数据分析</h1>
        <Space>
          <span style={{ color: "#8a8a8a", marginRight: "8px" }}>
            时间线范围：
          </span>
          <Select
            value={timelineDays}
            onChange={handleTimelineDaysChange}
            style={{ width: 120 }}
          >
            <Option value={7}>近 7 天</Option>
            <Option value={30}>近 30 天</Option>
            <Option value={60}>近 60 天</Option>
            <Option value={90}>近 90 天</Option>
          </Select>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            style={{
              background: "linear-gradient(90deg, #9945FF 0%, #14F195 100%)",
              border: "none",
            }}
          >
            刷新数据
          </Button>
        </Space>
      </div>

      {/* 概览统计卡片 - 第一行 */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总 KOL 数"
            value={overviewStats?.totalKols || 0}
            icon={<TeamOutlined />}
            loading={loadingOverview}
            description="数据库中所有 KOL 总数"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总联系数"
            value={overviewStats?.totalContacts || 0}
            icon={<PhoneOutlined />}
            loading={loadingOverview}
            description="除新添加外的所有 KOL 数量（6个状态之和）"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`${getTimeRangeLabel()}新增`}
            value={overviewStats?.newKolsThisWeek || 0}
            icon={<UserAddOutlined />}
            loading={loadingOverview}
            description={`过去 ${timelineDays} 天内创建的 KOL 数量`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`${getTimeRangeLabel()}联系数`}
            value={overviewStats?.contactedThisWeek || 0}
            icon={<PhoneOutlined />}
            loading={loadingOverview}
            description={`过去 ${timelineDays} 天除新增外的所有 KOL`}
          />
        </Col>
      </Row>

      {/* 概览统计卡片 - 第二行 */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="总体响应率"
            value={overviewStats?.overallResponseRate || 0}
            suffix="%"
            icon={<PercentageOutlined />}
            loading={loadingOverview}
            valueStyle={{
              color:
                (overviewStats?.overallResponseRate || 0) > 50
                  ? "#14F195"
                  : "#FFA500",
            }}
            description="除(新增外+已联系)KOL ÷ 除新增外KOL"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`${getTimeRangeLabel()}响应率`}
            value={overviewStats?.weeklyResponseRate || 0}
            suffix="%"
            icon={<PercentageOutlined />}
            loading={loadingOverview}
            valueStyle={{
              color:
                (overviewStats?.weeklyResponseRate || 0) > 50
                  ? "#14F195"
                  : "#FFA500",
            }}
            description={`过去 ${timelineDays} 天的响应率`}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="活跃合作数"
            value={overviewStats?.activePartnerships || 0}
            icon={<StarOutlined />}
            loading={loadingOverview}
            description="状态为「合作中」的 KOL 数量"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="待跟进数"
            value={overviewStats?.pendingFollowups || 0}
            icon={<BellOutlined />}
            loading={loadingOverview}
            valueStyle={{
              color:
                (overviewStats?.pendingFollowups || 0) > 0
                  ? "#FFA500"
                  : "#14F195",
            }}
            description="状态为「已回复」需要跟进的 KOL"
          />
        </Col>
      </Row>

      {/* KOL 分布图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <FollowerDistributionChart
            data={kolDistributions?.byFollowerCount || []}
            loading={loadingDistributions}
          />
        </Col>
        <Col xs={24} lg={12}>
          <QualityScoreChart
            data={kolDistributions?.byQualityScore || []}
            loading={loadingDistributions}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <ContentCategoryChart
            data={kolDistributions?.byContentCategory || []}
            loading={loadingDistributions}
          />
        </Col>
        <Col xs={24} lg={12}>
          <StatusDistributionChart
            data={kolDistributions?.byStatus || []}
            loading={loadingDistributions}
          />
        </Col>
      </Row>

      {/* 语言分布（折线图）和模板分类统计（柱状图）*/}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} lg={12}>
          <LanguageDistributionChart
            data={kolDistributions?.byLanguage || []}
            loading={loadingDistributions}
          />
        </Col>
        <Col xs={24} lg={12}>
          <TemplateCategoryChart
            data={templateEffectiveness}
            loading={loadingTemplates}
          />
        </Col>
      </Row>

      {/* 联系时间线图表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <ContactTimelineChart
            data={contactTimeline}
            loading={loadingTimeline}
          />
        </Col>
      </Row>
    </div>
  );
};
