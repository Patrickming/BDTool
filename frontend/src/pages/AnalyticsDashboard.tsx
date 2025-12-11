/**
 * 分析仪表盘页面
 */

import React, { useEffect, useMemo, useState } from "react";
import { Row, Col, Select, Space, DatePicker, Modal, Table, Tag, message, Input } from "antd";
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { SearchOutlined } from "@ant-design/icons";
import {
  TeamOutlined,
  UserAddOutlined,
  PhoneOutlined,
  PercentageOutlined,
  StarOutlined,
  BellOutlined,
  CalendarOutlined,
  GlobalOutlined,
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
const { RangePicker } = DatePicker;

// KOL 状态映射
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new: { label: '新添加', color: 'default' },
  contacted: { label: '已联系', color: 'blue' },
  replied: { label: '已回复', color: 'green' },
  negotiating: { label: '洽谈中', color: 'orange' },
  cooperating: { label: '合作中', color: 'cyan' },
  cooperated: { label: '已合作', color: 'blue' },
  rejected: { label: '已拒绝', color: 'red' },
};

interface RespondedKol {
  id: number;
  username: string;
  displayName: string;
  qualityScore: number;
  status: string;
}

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

  // 自定义日期范围状态
  const [customDateRange, setCustomDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [isCustomRange, setIsCustomRange] = useState(false);

  // KOL 详情弹窗状态（通用）
  const [kolModalVisible, setKolModalVisible] = useState(false);
  const [kolModalTitle, setKolModalTitle] = useState('');
  const [kolsData, setKolsData] = useState<RespondedKol[]>([]);
  const [loadingKols, setLoadingKols] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAllAnalytics();
  }, [fetchAllAnalytics]);

  // 通用的 KOL 列表获取函数
  const fetchKolList = async (endpoint: string, title: string) => {
    setLoadingKols(true);
    setSearchText(''); // 重置搜索框
    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("获取失败");
      }

      const data = await response.json();
      setKolsData(data.data || []);
      setKolModalTitle(title);
      setKolModalVisible(true);
    } catch (error) {
      message.error(`获取 KOL 列表失败`);
      console.error(error);
    } finally {
      setLoadingKols(false);
    }
  };

  // 过滤 KOL 数据（根据搜索文本）
  const filteredKolsData = useMemo(() => {
    if (!searchText.trim()) {
      return kolsData;
    }
    const lowerSearch = searchText.toLowerCase();
    return kolsData.filter(
      (kol) =>
        kol.username.toLowerCase().includes(lowerSearch) ||
        kol.displayName?.toLowerCase().includes(lowerSearch) ||
        kol.id.toString().includes(lowerSearch)
    );
  }, [kolsData, searchText]);

  // 获取新增 KOL 列表
  const fetchNewKols = async () => {
    await fetchKolList(
      `/api/v1/analytics/new-kols?days=${timelineDays}`,
      `${getTimeRangeLabel()}新增的 KOL 列表`
    );
  };

  // 获取联系 KOL 列表
  const fetchContactedKols = async () => {
    await fetchKolList(
      `/api/v1/analytics/contacted-kols?days=${timelineDays}`,
      `${getTimeRangeLabel()}联系的 KOL 列表`
    );
  };

  // 获取响应 KOL 列表
  const fetchRespondedKols = async () => {
    await fetchKolList(
      `/api/v1/analytics/responded-kols?days=${timelineDays}`,
      `${getTimeRangeLabel()}响应的 KOL 列表`
    );
  };

  // 获取总体响应 KOL 列表
  const fetchAllRespondedKols = async () => {
    await fetchKolList(
      `/api/v1/analytics/all-responded-kols`,
      `总体响应的 KOL 列表`
    );
  };

  // 获取活跃合作 KOL 列表
  const fetchActivePartnershipKols = async () => {
    await fetchKolList(
      `/api/v1/analytics/active-partnerships`,
      `活跃合作的 KOL 列表`
    );
  };

  // 获取待跟进 KOL 列表
  const fetchPendingFollowupKols = async () => {
    await fetchKolList(
      `/api/v1/analytics/pending-followups`,
      `待跟进的 KOL 列表`
    );
  };

  const handleTimelineDaysChange = async (days: number | string) => {
    if (days === 'custom') {
      setIsCustomRange(true);
      return;
    }

    setIsCustomRange(false);
    setCustomDateRange(null);
    setTimelineDays(days as number);
    // 同时更新概览统计和时间线数据
    await Promise.all([
      useAnalyticsStore.getState().fetchOverviewStats(days as number),
      fetchContactTimeline(days as number),
    ]);
  };

  // 处理自定义日期范围选择
  const handleCustomDateChange = async (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates || !dates[0] || !dates[1]) {
      setCustomDateRange(null);
      return;
    }

    const validDates: [Dayjs, Dayjs] = [dates[0], dates[1]];
    setCustomDateRange(validDates);

    // 计算日期范围的天数
    const [start, end] = validDates;
    const days = end.diff(start, 'day') + 1; // +1 包含结束日期

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

  // 计算时间范围显示
  const timeRangeDisplay = useMemo(() => {
    // 格式化为 MM/DD
    const formatDate = (dateStr: string) => {
      const [, month, day] = dateStr.split('-');
      return `${month}/${day}`;
    };

    // 获取 UTC 偏移量
    const getUTCOffset = () => {
      const now = new Date();
      const offset = now.getTimezoneOffset();
      const hours = Math.abs(Math.floor(offset / 60));
      const minutes = Math.abs(offset % 60);
      const sign = offset <= 0 ? '+' : '-';
      return `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    let startStr: string;
    let endStr: string;

    // 如果是自定义日期范围，使用自定义的日期
    if (isCustomRange && customDateRange) {
      startStr = customDateRange[0].format('YYYY-MM-DD');
      endStr = customDateRange[1].format('YYYY-MM-DD');
    } else {
      // 使用默认的天数计算
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const startDate = new Date(todayStr);
      startDate.setUTCDate(startDate.getUTCDate() - (timelineDays - 1));
      startStr = startDate.toISOString().split('T')[0];
      endStr = todayStr;
    }

    return {
      start: formatDate(startStr),
      end: formatDate(endStr),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: getUTCOffset(),
    };
  }, [timelineDays, isCustomRange, customDateRange]);

  return (
    <div>
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
        <Space size="middle">
          <span style={{ color: "#8a8a8a" }}>
            时间线范围：
          </span>
          <Select
            value={isCustomRange ? 'custom' : timelineDays}
            onChange={handleTimelineDaysChange}
            style={{ width: 120 }}
          >
            <Option value={7}>近 7 天</Option>
            <Option value={30}>近 30 天</Option>
            <Option value={60}>近 60 天</Option>
            <Option value={90}>近 90 天</Option>
            <Option value="custom">自定义</Option>
          </Select>
          {isCustomRange && (
            <RangePicker
              value={customDateRange}
              onChange={handleCustomDateChange}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current > dayjs().endOf('day')}
              style={{ width: 240 }}
              placeholder={['开始日期', '结束日期']}
            />
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "8px 16px",
              background: "rgba(153, 69, 255, 0.1)",
              borderRadius: "8px",
              border: "1px solid rgba(153, 69, 255, 0.2)",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#9945FF" }}>
              <CalendarOutlined />
              <span style={{ color: "#fff" }}>
                {timeRangeDisplay.start} ~ {timeRangeDisplay.end}
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "#8a8a8a", fontSize: "12px" }}>
              <GlobalOutlined />
              {timeRangeDisplay.timezone} ({timeRangeDisplay.utcOffset})
            </span>
          </div>
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
            onViewDetails={fetchNewKols}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title={`${getTimeRangeLabel()}联系数`}
            value={overviewStats?.contactedThisWeek || 0}
            icon={<PhoneOutlined />}
            loading={loadingOverview}
            description={`过去 ${timelineDays} 天除新增外的所有 KOL`}
            onViewDetails={fetchContactedKols}
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
            onViewDetails={fetchAllRespondedKols}
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
            onViewDetails={fetchRespondedKols}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="活跃合作数"
            value={overviewStats?.activePartnerships || 0}
            icon={<StarOutlined />}
            loading={loadingOverview}
            description="状态为「合作中」的 KOL 数量"
            onViewDetails={fetchActivePartnershipKols}
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
            onViewDetails={fetchPendingFollowupKols}
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

      {/* KOL 详情弹窗（通用） */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '24px' }}>
            <span>{kolModalTitle}</span>
            <Input
              placeholder="搜索 ID、用户名或显示名称"
              prefix={<SearchOutlined style={{ color: '#9945FF' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              style={{ width: 280 }}
            />
          </div>
        }
        open={kolModalVisible}
        onCancel={() => {
          setKolModalVisible(false);
          setSearchText('');
        }}
        footer={null}
        width={900}
        styles={{
          body: {
            maxHeight: '600px',
            overflowY: 'auto',
          },
        }}
      >
        <Table
          dataSource={filteredKolsData}
          loading={loadingKols}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个 KOL${searchText ? ` (筛选自 ${kolsData.length} 个)` : ''}`,
          }}
          columns={[
            {
              title: 'ID',
              dataIndex: 'id',
              key: 'id',
              width: 80,
              sorter: (a, b) => a.id - b.id,
            },
            {
              title: '用户名',
              dataIndex: 'username',
              key: 'username',
              render: (username: string) => (
                <a
                  href={`https://x.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#9945FF' }}
                >
                  @{username}
                </a>
              ),
            },
            {
              title: '显示名称',
              dataIndex: 'displayName',
              key: 'displayName',
            },
            {
              title: '质量分',
              dataIndex: 'qualityScore',
              key: 'qualityScore',
              width: 100,
              sorter: (a, b) => a.qualityScore - b.qualityScore,
              render: (score: number) => (
                <span style={{
                  color: score >= 80 ? '#14F195' : score >= 60 ? '#FFA500' : '#fff',
                  fontWeight: 600
                }}>
                  {score}
                </span>
              ),
            },
            {
              title: '当前状态',
              dataIndex: 'status',
              key: 'status',
              width: 120,
              render: (status: string) => {
                const statusInfo = STATUS_MAP[status] || { label: status, color: 'default' };
                return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
              },
            },
          ]}
        />
      </Modal>
    </div>
  );
};
