/**
 * 翻译相关类型定义
 */

/**
 * 翻译请求
 */
export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

/**
 * 翻译响应
 */
export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  targetLanguage: string;
  sourceLanguage: string;
}
