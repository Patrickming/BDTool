/**
 * 翻译 API 服务
 */

import { api } from "../lib/axios";
import type {
  TranslateRequest,
  TranslateResponse,
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
