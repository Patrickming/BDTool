/**
 * 模板复制对话框
 * 选择KOL后预览并复制替换后的模板内容
 */

import { useState, useEffect } from "react";
import {
  Modal,
  Select,
  Button,
  Input,
  message,
  Space,
  Typography,
  Spin,
  Checkbox,
  Tooltip,
} from "antd";
import { CopyOutlined, CheckOutlined, RobotOutlined } from "@ant-design/icons";
import type { Template } from "@/types/template";
import { kolService } from "@/services/kol.service";
import { previewTemplate } from "@/services/template.service";
import { aiService } from "@/services/ai.service";
import type { KOL } from "@/types/kol";
import type { AITone } from "@/types/ai";

const { TextArea } = Input;
const { Text } = Typography;

interface TemplateCopyModalProps {
  open: boolean;
  template: Template | null;
  onClose: () => void;
}

export const TemplateCopyModal: React.FC<TemplateCopyModalProps> = ({
  open,
  template,
  onClose,
}) => {
  const [kols, setKols] = useState<KOL[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [selectedKolId, setSelectedKolId] = useState<number | null>(null);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI 改写相关状态
  const [enableAIRewrite, setEnableAIRewrite] = useState(false);
  const [aiTone, setAiTone] = useState<AITone>("professional");
  const [aiLoading, setAiLoading] = useState(false);
  const [originalContent, setOriginalContent] = useState<string>("");
  const [aiRewrittenContent, setAiRewrittenContent] = useState<string>(""); // AI 改写后的内容
  const [hasAIRewritten, setHasAIRewritten] = useState(false); // 是否已进行AI改写

  // 加载KOL列表并初始化
  useEffect(() => {
    if (open && template) {
      loadKOLs();
      // 重置状态，默认选择第一个语言版本
      setSelectedLanguage(template.versions?.[0]?.language || "");
      setSelectedKolId(null);
      setPreviewContent(template.versions?.[0]?.content || "");
      setCopied(false);
      // 重置AI改写状态
      setHasAIRewritten(false);
      setAiRewrittenContent("");
    }
  }, [open, template]);

  // 当选择语言或KOL时，生成预览
  useEffect(() => {
    if (template && selectedLanguage) {
      generatePreview();
    }
  }, [selectedLanguage, selectedKolId, template]);

  const loadKOLs = async () => {
    try {
      setLoading(true);
      const response = await kolService.getKOLList({ page: 1, limit: 100 });
      setKols(response.kols);
    } catch (error: any) {
      message.error("加载 KOL 列表失败");
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = async () => {
    if (!template || !selectedLanguage) return;

    try {
      setLoading(true);
      const result = await previewTemplate({
        templateId: template.id,
        language: selectedLanguage,
        kolId: selectedKolId || undefined,
      });
      setPreviewContent(result.previewContent);
      setOriginalContent(result.previewContent); // 保存原始内容用于 AI 改写
    } catch (error: any) {
      message.error("生成预览失败");
      // 降级到使用本地版本内容
      const version = template.versions.find(
        (v) => v.language === selectedLanguage
      );
      const content = version?.content || "";
      setPreviewContent(content);
      setOriginalContent(content);
    } finally {
      setLoading(false);
    }
  };

  /**
   * AI 改写文本
   */
  const handleAIRewrite = async () => {
    if (!originalContent || !originalContent.trim()) {
      message.warning("内容为空，无法改写");
      return;
    }

    try {
      setAiLoading(true);
      const result = await aiService.rewriteText({
        text: originalContent,
        tone: aiTone,
        language: selectedLanguage as any,
        preserveVariables: true,
        // 不指定模型，使用后端配置的默认模型
      });

      setAiRewrittenContent(result.rewritten);
      setHasAIRewritten(true);
      message.success("AI 改写成功！");
    } catch (error: any) {
      message.error(error.response?.data?.error || "AI 改写失败，请重试");
      console.error("AI 改写失败:", error);
    } finally {
      setAiLoading(false);
    }
  };

  /**
   * 清除 AI 改写结果
   */
  const handleClearAIRewrite = () => {
    setAiRewrittenContent("");
    setHasAIRewritten(false);
    message.info("已清除 AI 改写内容");
  };

  const handleCopy = async () => {
    try {
      // 如果有AI改写内容，复制改写后的内容；否则复制原始预览内容
      const contentToCopy =
        hasAIRewritten && aiRewrittenContent
          ? aiRewrittenContent
          : previewContent;
      await navigator.clipboard.writeText(contentToCopy);
      message.success("已复制到剪贴板");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      message.error("复制失败，请手动复制");
    }
  };

  return (
    <Modal
      title="复制模板"
      open={open}
      onCancel={onClose}
      width={780}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="copy"
          type="primary"
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={handleCopy}
          disabled={!previewContent}
        >
          {copied ? "已复制" : "复制到剪贴板"}
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        {/* 模板信息 */}
        <div>
          <Text strong>模板：</Text>
          <Text style={{ marginLeft: 8 }}>{template?.name}</Text>
        </div>

        {/* 语言选择 */}
        <div>
          <Text strong style={{ marginBottom: 8, display: "block" }}>
            选择语言版本：
          </Text>
          <Select
            style={{ width: "100%" }}
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            options={template?.versions?.map((v) => ({
              value: v.language,
              label:
                v.language === "en"
                  ? "英语 (EN)"
                  : v.language === "zh"
                  ? "中文 (ZH)"
                  : v.language.toUpperCase(),
            }))}
          />
        </div>

        {/* KOL选择 */}
        <div>
          <Text strong style={{ marginBottom: 8, display: "block" }}>
            选择 KOL（可选）：
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="不选择则复制原始模板"
            allowClear
            showSearch
            loading={loading}
            value={selectedKolId}
            onChange={setSelectedKolId}
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={kols.map((kol) => ({
              value: kol.id,
              label: `@${kol.username} (${kol.displayName})`,
            }))}
          />
          <Text
            type="secondary"
            style={{ fontSize: 12, marginTop: 4, display: "block" }}
          >
            选择KOL后，模板中的变量（如 {"{{"} username {"}}"}
            ）会自动替换为该KOL的信息
          </Text>
        </div>

        {/* AI 改写选项 */}
        <div
          style={{
            padding: 16,
            background: "rgba(153, 69, 255, 0.05)",
            border: "1px solid rgba(153, 69, 255, 0.2)",
            borderRadius: 8,
          }}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Space>
                <Tooltip title="使用 AI 改写文本，保持意思不变但表达方式不同，避免 Twitter 识别为垃圾信息">
                  <Checkbox
                    checked={enableAIRewrite}
                    onChange={(e) => setEnableAIRewrite(e.target.checked)}
                  >
                    <RobotOutlined style={{ marginRight: 4 }} />
                    <Text strong>AI 改写</Text>
                  </Checkbox>
                </Tooltip>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  (glm-4.5airx 模型)
                </Text>
              </Space>
            </div>

            {enableAIRewrite && (
              <>
                <div>
                  <Text strong style={{ marginBottom: 8, display: "block" }}>
                    改写风格：
                  </Text>
                  <Select
                    style={{ width: "100%" }}
                    value={aiTone}
                    onChange={setAiTone}
                    options={[
                      {
                        value: "professional",
                        label: "专业 (Professional)",
                      },
                      {
                        value: "formal",
                        label: "正式 (Formal)",
                      },
                      {
                        value: "friendly",
                        label: "友好 (Friendly)",
                      },
                      {
                        value: "casual",
                        label: "轻松 (Casual)",
                      },
                    ]}
                  />
                </div>

                <Space size="small">
                  <Button
                    type="primary"
                    icon={<RobotOutlined />}
                    onClick={handleAIRewrite}
                    loading={aiLoading}
                    disabled={!previewContent || loading || hasAIRewritten}
                  >
                    {aiLoading
                      ? "AI 改写中..."
                      : hasAIRewritten
                      ? "已改写"
                      : "AI 改写"}
                  </Button>
                  {hasAIRewritten && (
                    <Button onClick={handleClearAIRewrite} disabled={aiLoading}>
                      清除改写
                    </Button>
                  )}
                </Space>

                <Text
                  type="secondary"
                  style={{ fontSize: 12, display: "block" }}
                >
                  ⚠️ AI 改写会保留模板变量（如 {"{{"} username {"}}"}
                  ），仅改变文本表达方式
                </Text>
              </>
            )}
          </Space>
        </div>

        {/* 原文内容 */}
        <div>
          <Text strong style={{ marginBottom: 8, display: "block" }}>
            {selectedKolId ? "原文（已替换变量）：" : "原文内容："}
          </Text>
          <Spin spinning={loading}>
            <TextArea
              value={previewContent}
              readOnly
              rows={hasAIRewritten ? 10 : 18}
              style={{
                fontSize: 14,
                lineHeight: "1.6",
                fontFamily: "monospace",
                background: "#f5f5f5",
                border: "1px solid #d9d9d9",
                resize: "vertical",
                minHeight: hasAIRewritten ? "180px" : "250px",
              }}
            />
          </Spin>
        </div>

        {/* AI 改写后的内容 */}
        {hasAIRewritten && aiRewrittenContent && (
          <div>
            <Text strong style={{ marginBottom: 8, display: "block" }}>
              <RobotOutlined style={{ marginRight: 4, color: "#9945FF" }} />
              AI 改写后的内容：
            </Text>
            <TextArea
              value={aiRewrittenContent}
              readOnly
              rows={10}
              style={{
                fontSize: 14,
                lineHeight: "1.6",
                fontFamily: "monospace",
                background: "rgba(153, 69, 255, 0.08)",
                border: "2px solid rgba(153, 69, 255, 0.3)",
                resize: "vertical",
                minHeight: "180px",
              }}
            />
            <Text
              type="secondary"
              style={{ fontSize: 12, marginTop: 8, display: "block" }}
            >
              💡 点击「复制到剪贴板」将复制改写后的内容
            </Text>
          </div>
        )}

        {/* 提示信息 */}
        {selectedKolId && (
          <div
            style={{
              padding: 12,
              background: "rgba(20, 241, 149, 0.1)",
              border: "1px solid rgba(20, 241, 149, 0.3)",
              borderRadius: 8,
            }}
          >
            <Text type="success">✓ 已替换 KOL 变量，可以直接使用</Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};
