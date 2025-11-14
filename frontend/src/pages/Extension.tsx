/**
 * 插件内容页面
 * 包含插件介绍、下载、加载教程、Token 管理
 */

import { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Steps,
  Button,
  message,
  Modal,
  Statistic,
  Tag,
  Alert,
  Collapse,
  Space,
  Row,
  Col,
} from "antd";
import {
  RocketOutlined,
  DownloadOutlined,
  SafetyOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  ApiOutlined,
  ChromeOutlined,
  TwitterOutlined,
  CodeOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/auth.store";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

export default function Extension() {
  const { user } = useAuthStore();
  const [extensionToken, setExtensionToken] = useState<string | null>(null);
  const [tokenExpiry, setTokenExpiry] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 加载现有 Token
  useEffect(() => {
    loadExtensionToken();
  }, []);

  // 加载扩展 Token
  const loadExtensionToken = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/extension/token",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExtensionToken(data.token);
        setTokenExpiry(data.expiresAt ? new Date(data.expiresAt) : null);
      }
    } catch (error) {
      console.error("加载 Token 失败:", error);
    }
  };

  // 复制 Token
  const handleCopyToken = () => {
    if (!extensionToken) {
      message.warning("请先生成 Token");
      return;
    }

    Modal.confirm({
      title: "确认复制/刷新 Token？",
      content: (
        <div>
          <p style={{ marginBottom: 8 }}>
            复制 Token 后，有效期将重新计算为 2 小时。
          </p>
          <p style={{ color: "#faad14", marginBottom: 0 }}>
            每次点击此按钮都会刷新倒计时，无需重新生成新的 Token。
          </p>
        </div>
      ),
      okText: "确认",
      cancelText: "取消",
      width: 480,
      centered: true,
      onOk: async () => {
        try {
          await navigator.clipboard.writeText(extensionToken);

          // 激活 Token（开始/刷新倒计时）
          const response = await fetch(
            "http://localhost:3000/api/v1/extension/token/activate",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            setTokenExpiry(new Date(data.expiresAt));
            message.success("Token 已复制到剪贴板，倒计时已刷新");
          }
        } catch (error) {
          message.error("复制失败，请手动复制");
        }
      },
    });
  };

  // 生成新 Token
  const handleGenerateToken = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/extension/token/generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setExtensionToken(data.token);
        setTokenExpiry(null);
        message.success("Token 生成成功");
      } else {
        message.error("Token 生成失败");
      }
    } catch (error) {
      message.error("网络错误");
    } finally {
      setIsGenerating(false);
    }
  };

  // 计算剩余时间
  const getRemainingTime = () => {
    if (!tokenExpiry) return null;

    const now = new Date();
    const diff = tokenExpiry.getTime() - now.getTime();

    if (diff <= 0) return "已过期";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  // 每秒更新倒计时
  useEffect(() => {
    if (!tokenExpiry) return;

    const timer = setInterval(() => {
      const remaining = getRemainingTime();
      if (remaining === "已过期") {
        // Token 过期，刷新状态
        loadExtensionToken();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [tokenExpiry]);

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ color: "#fff", marginBottom: 8 }}>
          <ChromeOutlined style={{ color: "#FF8C00", marginRight: 12 }} />
          浏览器插件
        </Title>
        <Text style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: 16 }}>
          一键捕获 Twitter KOL 数据，快速导入系统
        </Text>
      </div>

      {/* Token 管理区域 */}
      <Card
        style={{
          background: "rgba(255, 140, 0, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 140, 0, 0.2)",
          boxShadow: "0 8px 32px rgba(255, 140, 0, 0.1)",
          marginBottom: 32,
        }}
        bodyStyle={{ padding: 32 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <KeyOutlined style={{ fontSize: 24, color: "#FF8C00" }} />
          <Title level={3} style={{ margin: 0, color: "#fff" }}>
            插件 Token
          </Title>
        </div>

        <Alert
          message="插件认证说明"
          description="插件使用独立的 Token 进行身份验证。点击「复制/刷新 Token」后，Token 有效期将重新计算为 2 小时。如果 Token 已过期或想更换新的 Token，请点击「重新生成」。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            {extensionToken ? (
              <Card
                bordered={false}
                style={{
                  background: "rgba(20, 241, 149, 0.05)",
                  border: "1px solid rgba(20, 241, 149, 0.2)",
                }}
              >
                <div style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    当前 Token
                  </Text>
                  <div
                    style={{
                      background: "rgba(0, 0, 0, 0.3)",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      fontFamily: "Monaco, monospace",
                      fontSize: 12,
                      color: "#14F195",
                      wordBreak: "break-all",
                    }}
                  >
                    {extensionToken}
                  </div>
                </div>

                <Space size="middle">
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={handleCopyToken}
                  >
                    复制/刷新 Token
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={handleGenerateToken}
                    loading={isGenerating}
                  >
                    重新生成
                  </Button>
                </Space>
              </Card>
            ) : (
              <Card
                bordered={false}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    display: "block",
                    marginBottom: 16,
                  }}
                >
                  尚未生成 Token
                </Text>
                <Button
                  type="primary"
                  icon={<ApiOutlined />}
                  onClick={handleGenerateToken}
                  loading={isGenerating}
                >
                  生成 Token
                </Button>
              </Card>
            )}
          </Col>

          <Col xs={24} lg={12}>
            <Card
              bordered={false}
              style={{
                background: tokenExpiry
                  ? "rgba(255, 140, 0, 0.05)"
                  : "rgba(255, 255, 255, 0.02)",
                border: tokenExpiry
                  ? "1px solid rgba(255, 140, 0, 0.2)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <ClockCircleOutlined
                  style={{
                    fontSize: 48,
                    color: tokenExpiry ? "#FF8C00" : "rgba(255, 255, 255, 0.3)",
                    marginBottom: 16,
                  }}
                />
                <div>
                  <Text
                    style={{
                      color: "rgba(255, 255, 255, 0.6)",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    剩余有效时间
                  </Text>
                  <Title
                    level={2}
                    style={{
                      margin: 0,
                      color: tokenExpiry
                        ? "#FF8C00"
                        : "rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    {tokenExpiry ? getRemainingTime() : "未激活"}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 插件介绍 */}
      <Card
        style={{
          background: "rgba(153, 69, 255, 0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(153, 69, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(153, 69, 255, 0.1)",
          marginBottom: 32,
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Title level={3} style={{ color: "#fff", marginBottom: 24 }}>
          <RocketOutlined style={{ color: "#9945FF", marginRight: 12 }} />
          插件功能
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={6}>
            <div style={{ textAlign: "center", padding: 24 }}>
              <TwitterOutlined
                style={{ fontSize: 48, color: "#9945FF", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "#fff", marginBottom: 12 }}>
                一键捕获
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                在 Twitter 用户主页一键提取 KOL 信息
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <div style={{ textAlign: "center", padding: 24 }}>
              <SafetyOutlined
                style={{ fontSize: 48, color: "#14F195", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "#fff", marginBottom: 12 }}>
                本地编辑
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                捕获后可本地编辑质量评分和分类
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <div style={{ textAlign: "center", padding: 24 }}>
              <CheckCircleOutlined
                style={{ fontSize: 48, color: "#00D4AA", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "#fff", marginBottom: 12 }}>
                批量上传
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                一键上传到系统，自动去重处理
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <div style={{ textAlign: "center", padding: 24 }}>
              <CodeOutlined
                style={{ fontSize: 48, color: "#FF8C00", marginBottom: 16 }}
              />
              <Title level={4} style={{ color: "#fff", marginBottom: 12 }}>
                模板 + AI ⭐
              </Title>
              <Text style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                模板复制与 AI 智能改写
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 下载和安装教程 */}
      <Card
        style={{
          background: "rgba(20, 241, 149, 0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(20, 241, 149, 0.2)",
          boxShadow: "0 8px 32px rgba(20, 241, 149, 0.1)",
          marginBottom: 32,
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Title level={3} style={{ color: "#fff", marginBottom: 24 }}>
          <DownloadOutlined style={{ color: "#14F195", marginRight: 12 }} />
          下载和安装
        </Title>

        <Steps
          direction="vertical"
          current={-1}
          items={[
            {
              title: (
                <span style={{ color: "#fff", fontSize: 16 }}>获取插件</span>
              ),
              description: (
                <Paragraph
                  style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: 12 }}
                >
                  插件位于项目目录：<code>/extension</code>
                </Paragraph>
              ),
            },
            {
              title: (
                <span style={{ color: "#fff", fontSize: 16 }}>
                  开启开发者模式
                </span>
              ),
              description: (
                <Paragraph
                  style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: 12 }}
                >
                  1. 在 Chrome 浏览器打开 <code>chrome://extensions/</code>
                  <br />
                  2. 点击右上角的「开发者模式」开关
                </Paragraph>
              ),
            },
            {
              title: (
                <span style={{ color: "#fff", fontSize: 16 }}>加载插件</span>
              ),
              description: (
                <Paragraph
                  style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: 12 }}
                >
                  1. 点击「加载已解压的扩展程序」
                  <br />
                  2. 选择 <code>/extension</code> 目录
                  <br />
                  3. 插件将出现在扩展程序列表中
                </Paragraph>
              ),
            },
            {
              title: (
                <span style={{ color: "#fff", fontSize: 16 }}>配置 Token</span>
              ),
              description: (
                <Paragraph
                  style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: 12 }}
                >
                  1. 从本页面复制 Token
                  <br />
                  2. 点击插件图标
                  <br />
                  3. 在设置中粘贴 Token
                </Paragraph>
              ),
            },
            {
              title: (
                <span style={{ color: "#fff", fontSize: 16 }}>开始使用</span>
              ),
              description: (
                <Paragraph
                  style={{ color: "rgba(255, 255, 255, 0.6)", marginTop: 12 }}
                >
                  访问 Twitter 用户主页（例如
                  x.com/elonmusk），点击插件图标即可开始捕获 KOL 数据
                </Paragraph>
              ),
            },
          ]}
        />
      </Card>

      {/* 使用说明 */}
      <Card
        style={{
          background: "rgba(220, 31, 255, 0.03)",
          borderRadius: "16px",
          border: "1px solid rgba(220, 31, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(220, 31, 255, 0.1)",
        }}
        bodyStyle={{ padding: 32 }}
      >
        <Title level={3} style={{ color: "#fff", marginBottom: 24 }}>
          <CodeOutlined style={{ color: "#DC1FFF", marginRight: 12 }} />
          使用说明
        </Title>

        <Collapse
          bordered={false}
          style={{ background: "transparent" }}
          expandIconPosition="end"
          defaultActiveKey={["5"]}
        >
          <Panel
            header={
              <Text style={{ color: "#fff", fontSize: 16 }}>
                如何捕获 KOL？
              </Text>
            }
            key="1"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              1. 访问 Twitter KOL 主页（URL 格式：https://x.com/用户名）
              <br />
              2. 确保页面完全加载
              <br />
              3. 点击浏览器工具栏中的插件图标
              <br />
              4. 点击「捕获 KOL 数据」按钮
              <br />
              5. 数据将保存到本地
            </Paragraph>
          </Panel>
          <Panel
            header={
              <Text style={{ color: "#fff", fontSize: 16 }}>
                如何填写额外信息？
              </Text>
            }
            key="2"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              1. 点击「查看数据」按钮
              <br />
              2. 填写质量评分（1-5 分）
              <br />
              3. 选择内容分类（合约交易分析、代币交易分析、Web3 通用、未分类）
              <br />
              4. （可选）填写自定义备注
              <br />
              5. 点击「保存修改」
            </Paragraph>
          </Panel>
          <Panel
            header={
              <Text style={{ color: "#fff", fontSize: 16 }}>
                如何上传到系统？
              </Text>
            }
            key="3"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              1. 确保所有 KOL 已填写必填字段（质量评分、内容分类）
              <br />
              2. 点击「上传到数据库」按钮
              <br />
              3. 确认上传
              <br />
              4. 系统会自动去重，已存在的 KOL 会被跳过
              <br />
              5. 上传成功后，本地数据会被清空
            </Paragraph>
          </Panel>
          <Panel
            header={
              <Text style={{ color: "#fff", fontSize: 16 }}>
                Token 过期了怎么办？
              </Text>
            }
            key="4"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              <strong>方法 1（推荐）</strong>：如果 Token 还没完全过期或刚过期：
              <br />
              1. 返回本页面
              <br />
              2. 点击「复制/刷新 Token」按钮
              <br />
              3. 有效期会自动重新计算为 2 小时
              <br />
              <br />
              <strong>方法 2</strong>：如果想换一个全新的 Token：
              <br />
              1. 返回本页面
              <br />
              2. 点击「重新生成」按钮
              <br />
              3. 复制新的 Token
              <br />
              4. 在插件中更新 Token
            </Paragraph>
          </Panel>
          <Panel
            header={
              <Text style={{ color: "#fff", fontSize: 16 }}>
                ⭐ 如何使用模板复制功能？
                <Tag color="orange" style={{ marginLeft: 8 }}>
                  新功能
                </Tag>
              </Text>
            }
            key="5"
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}
          >
            <Paragraph
              style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: 16 }}
            >
              <strong style={{ color: "#FF8C00" }}>功能说明</strong>
              <br />
              模板复制功能位于插件侧边栏底部（需要先配置
              Token），支持选择模板、替换 KOL 变量、AI 改写等操作。
            </Paragraph>

            <Paragraph
              style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: 16 }}
            >
              <strong style={{ color: "#14F195" }}>基础使用流程</strong>
              <br />
              1. 在插件中搜索并选择模板
              <br />
              2. （可选）搜索并选择 KOL，自动替换模板中的 {`{{username}}`}、
              {`{{display_name}}`} 等变量
              <br />
              3. 点击「📋 复制模板内容」
              <br />
              4. 粘贴到 Twitter DM 或评论中
            </Paragraph>

            <Paragraph
              style={{ color: "rgba(255, 255, 255, 0.6)", marginBottom: 16 }}
            >
              <strong style={{ color: "#9945FF" }}>AI 改写功能</strong>
              <br />
              1. 勾选「🤖 AI 改写内容」
              <br />
              2. 选择改写风格：
              <br />
              &nbsp;&nbsp;&nbsp;• <strong>专业 (Professional)</strong>
              ：适合商务场合
              <br />
              &nbsp;&nbsp;&nbsp;• <strong>正式 (Formal)</strong>：更加严肃正式
              <br />
              &nbsp;&nbsp;&nbsp;• <strong>友好 (Friendly)</strong>：友好亲切
              <br />
              &nbsp;&nbsp;&nbsp;• <strong>轻松 (Casual)</strong>：轻松随意
              <br />
              3. 点击「📋 复制模板内容」
              <br />
              4. AI 会自动改写内容（保留变量占位符）
              <br />
              5. 改写完成后自动复制到剪贴板
            </Paragraph>

            <Paragraph style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              <strong style={{ color: "#DC1FFF" }}>使用场景示例</strong>
              <br />
              <strong>场景 1</strong>：标准邀请
              <br />
              &nbsp;&nbsp;选择模板 → 选择 KOL → 直接复制（不启用 AI）
              <br />
              <br />
              <strong>场景 2</strong>：个性化邀请
              <br />
              &nbsp;&nbsp;选择模板 → 选择 KOL → 启用 AI（友好风格）→ 复制
              <br />
              <br />
              <strong>场景 3</strong>：通用模板
              <br />
              &nbsp;&nbsp;选择模板 → 不选 KOL → 启用 AI（专业风格）→
              复制（保留变量后续手动替换）
            </Paragraph>
          </Panel>
          <Panel
            header={
              <Text style={{ color: "#fff", fontSize: 16 }}>
                AI 改写注意事项
              </Text>
            }
            key="6"
          >
            <Paragraph style={{ color: "rgba(255, 255, 255, 0.6)" }}>
              <strong>响应时间</strong>
              <br />
              • 通常需要 5-15 秒
              <br />
              • 最长等待 120 秒（超时会提示错误）
              <br />
              <br />
              <strong>变量保留</strong>
              <br />• AI 改写会自动保留所有 {`{{变量}}`} 格式的占位符
              <br />• 例如：{`{{username}}`}、{`{{display_name}}`}、{`{{bio}}`}{" "}
              等
              <br />
              <br />
              <strong>故障排除</strong>
              <br />
              • 如果 AI 改写失败，请检查：
              <br />
              &nbsp;&nbsp;1. Token 是否有效（未过期）
              <br />
              &nbsp;&nbsp;2. 后端服务是否运行正常
              <br />
              &nbsp;&nbsp;3. 智谱 AI API Key 是否配置正确
              <br />
              &nbsp;&nbsp;4. 网络连接是否正常
            </Paragraph>
          </Panel>
        </Collapse>
      </Card>
    </div>
  );
}
