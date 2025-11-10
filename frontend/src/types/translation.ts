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

/**
 * 批量翻译请求
 */
export interface BatchTranslateRequest {
  texts: string[];
  targetLanguage: string;
  sourceLanguage?: string;
}

/**
 * 批量翻译项
 */
export interface BatchTranslationItem {
  original: string;
  translated: string;
}

/**
 * 批量翻译响应
 */
export interface BatchTranslateResponse {
  count: number;
  translations: BatchTranslationItem[];
  targetLanguage: string;
  sourceLanguage: string;
}

/**
 * 语言检测请求
 */
export interface DetectLanguageRequest {
  text: string;
}

/**
 * 语言检测响应
 */
export interface DetectLanguageResponse {
  text: string;
  detectedLanguage: string;
  confidence: number;
}

/**
 * 翻译服务状态响应
 */
export interface TranslationStatusResponse {
  available: boolean;
  provider: string;
}
