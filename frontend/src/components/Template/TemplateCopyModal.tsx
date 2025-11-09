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
} from "antd";
import { CopyOutlined, CheckOutlined } from "@ant-design/icons";
import type { Template } from "@/types/template";
import { kolService } from "@/services/kol.service";
import { previewTemplate } from "@/services/template.service";
import type { KOL } from "@/types/kol";

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

  // 加载KOL列表并初始化
  useEffect(() => {
    if (open && template) {
      loadKOLs();
      // 重置状态，默认选择第一个语言版本
      setSelectedLanguage(template.versions?.[0]?.language || "");
      setSelectedKolId(null);
      setPreviewContent(template.versions?.[0]?.content || "");
      setCopied(false);
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
    } catch (error: any) {
      message.error("生成预览失败");
      // 降级到使用本地版本内容
      const version = template.versions.find(
        (v) => v.language === selectedLanguage
      );
      setPreviewContent(version?.content || "");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewContent);
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

        {/* 预览内容 */}
        <div>
          <Text strong style={{ marginBottom: 8, display: "block" }}>
            {selectedKolId ? "预览（已替换变量）：" : "模板内容："}
          </Text>
          <Spin spinning={loading}>
            <TextArea
              value={previewContent}
              readOnly
              rows={18}
              style={{
                fontSize: 14,
                lineHeight: "1.6",
                fontFamily: "monospace",
                background: "rgba(153, 69, 255, 0.05)",
                border: "1px solid rgba(153, 69, 255, 0.2)",
                resize: "vertical",
                minHeight: "250px",
              }}
            />
          </Spin>
        </div>

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
            <Text type="success">✓ 已替换变量，可以直接复制使用</Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};
