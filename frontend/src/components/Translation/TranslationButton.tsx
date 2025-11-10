/**
 * 翻译按钮组件
 * 用于模板编辑器中翻译文本内容
 */

import React, { useState } from "react";
import { Button, Dropdown, message, Modal, Select, Spin, Tooltip } from "antd";
import { TranslationOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { translateText } from "@/services/translation.service";
import type { MenuProps } from "antd";

interface TranslationButtonProps {
  /**
   * 源文本
   */
  sourceText: string;
  /**
   * 源语言代码
   */
  sourceLanguage: string;
  /**
   * 翻译完成回调
   */
  onTranslated: (translatedText: string, targetLanguage: string) => void;
  /**
   * 按钮类型
   */
  type?: "default" | "primary" | "text" | "link";
  /**
   * 按钮大小
   */
  size?: "small" | "middle" | "large";
  /**
   * 禁用状态
   */
  disabled?: boolean;
}

// 支持的翻译语言
const TRANSLATION_LANGUAGES = [
  { code: "en", name: "英语 (English)" },
  { code: "zh", name: "中文 (Chinese)" },
  { code: "ja", name: "日语 (Japanese)" },
  { code: "es", name: "西班牙语 (Spanish)" },
  { code: "pt", name: "葡萄牙语 (Portuguese)" },
  { code: "ko", name: "韩语 (Korean)" },
  { code: "fr", name: "法语 (French)" },
  { code: "de", name: "德语 (German)" },
  { code: "ru", name: "俄语 (Russian)" },
];

export const TranslationButton: React.FC<TranslationButtonProps> = ({
  sourceText,
  sourceLanguage,
  onTranslated,
  type = "default",
  size = "middle",
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState<
    string | undefined
  >();

  /**
   * 执行翻译
   */
  const handleTranslate = async (targetLanguage: string) => {
    if (!sourceText || !sourceText.trim()) {
      message.warning("源文本不能为空");
      return;
    }

    if (targetLanguage === sourceLanguage) {
      message.warning("目标语言不能与源语言相同");
      return;
    }

    try {
      setLoading(true);
      const result = await translateText({
        text: sourceText,
        targetLanguage,
        sourceLanguage,
      });

      message.success(
        `翻译成功: ${sourceLanguage.toUpperCase()} → ${targetLanguage.toUpperCase()}`
      );
      onTranslated(result.translatedText, targetLanguage);
    } catch (error: any) {
      console.error("Translation error:", error);
      if (error.response?.status === 503) {
        message.error(
          "翻译服务当前不可用，请联系管理员配置 Azure Translator API 密钥"
        );
      } else {
        message.error(error.response?.data?.message || "翻译失败");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 快速翻译菜单（常用语言）
   */
  const quickTranslateMenu: MenuProps["items"] = [
    {
      key: "en",
      label: "翻译为英语",
      icon: <TranslationOutlined />,
      disabled: sourceLanguage === "en",
      onClick: () => handleTranslate("en"),
    },
    {
      key: "zh",
      label: "翻译为中文",
      icon: <TranslationOutlined />,
      disabled: sourceLanguage === "zh",
      onClick: () => handleTranslate("zh"),
    },
    {
      key: "ja",
      label: "翻译为日语",
      icon: <TranslationOutlined />,
      disabled: sourceLanguage === "ja",
      onClick: () => handleTranslate("ja"),
    },
    {
      type: "divider",
    },
    {
      key: "more",
      label: "更多语言...",
      icon: <TranslationOutlined />,
      onClick: () => setModalOpen(true),
    },
  ];

  /**
   * 通过模态框选择语言翻译
   */
  const handleModalTranslate = async () => {
    if (!selectedTargetLanguage) {
      message.warning("请选择目标语言");
      return;
    }

    await handleTranslate(selectedTargetLanguage);
    setModalOpen(false);
    setSelectedTargetLanguage(undefined);
  };

  // 过滤掉源语言
  const availableLanguages = TRANSLATION_LANGUAGES.filter(
    (lang) => lang.code !== sourceLanguage
  );

  return (
    <>
      <Dropdown menu={{ items: quickTranslateMenu }} trigger={["click"]}>
        <Tooltip title="翻译到其他语言">
          <Button
            type={type}
            size={size}
            icon={<TranslationOutlined />}
            loading={loading}
            disabled={disabled || !sourceText?.trim()}
          >
            翻译
          </Button>
        </Tooltip>
      </Dropdown>

      <Modal
        title="选择目标语言"
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setSelectedTargetLanguage(undefined);
        }}
        onOk={handleModalTranslate}
        okText="翻译"
        cancelText="取消"
        confirmLoading={loading}
      >
        <div style={{ padding: "20px 0" }}>
          <Select
            style={{ width: "100%" }}
            placeholder="选择要翻译到的语言"
            value={selectedTargetLanguage}
            onChange={setSelectedTargetLanguage}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={availableLanguages.map((lang) => ({
              value: lang.code,
              label: lang.name,
            }))}
          />
        </div>
      </Modal>
    </>
  );
};
