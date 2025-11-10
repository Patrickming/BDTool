/**
 * 翻译 API 服务
 */

import { api } from "../lib/axios";
import type {
  TranslateRequest,
  TranslateResponse,
  BatchTranslateRequest,
  BatchTranslateResponse,
  DetectLanguageRequest,
  DetectLanguageResponse,
  TranslationStatusResponse,
} from "@/types/translation";

/**
 * 翻译文本
 */
export const translateText = async (
  data: TranslateRequest
): Promise<TranslateResponse> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: TranslateResponse;
  }>("/translation/translate", data);
  return response.data.data;
};

/**
 * 批量翻译
 */
export const batchTranslate = async (
  data: BatchTranslateRequest
): Promise<BatchTranslateResponse> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: BatchTranslateResponse;
  }>("/translation/batch", data);
  return response.data.data;
};

/**
 * 检测语言
 */
export const detectLanguage = async (
  data: DetectLanguageRequest
): Promise<DetectLanguageResponse> => {
  const response = await api.post<{
    success: boolean;
    message: string;
    data: DetectLanguageResponse;
  }>("/translation/detect", data);
  return response.data.data;
};

/**
 * 获取翻译服务状态
 */
export const getTranslationStatus =
  async (): Promise<TranslationStatusResponse> => {
    const response = await api.get<{
      success: boolean;
      message: string;
      data: TranslationStatusResponse;
    }>("/translation/status");
    return response.data.data;
  };
