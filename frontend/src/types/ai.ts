/**
 * AI 功能相关类型定义
 */

export type AITone = 'professional' | 'casual' | 'friendly' | 'formal';

export type AILanguage = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'pt' | 'fr' | 'de' | 'ru';

export type AIModel = 'glm-4.6' | 'glm-4.5' | 'glm-4.5-x' | 'glm-4-plus' | 'glm-4-air' | 'glm-4-airx' | 'glm-4.5-airx' | 'glm-4-flash';

/**
 * 文本改写请求参数
 */
export interface RewriteTextRequest {
  text: string;
  tone?: AITone;
  language?: AILanguage;
  preserveVariables?: boolean;
  maxLength?: number;
  model?: AIModel;
}

/**
 * 文本改写响应
 */
export interface RewriteTextResponse {
  success: boolean;
  data: {
    original: string;
    rewritten: string;
    tone: string;
    language: string;
    model: string;
    tokensUsed: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}

/**
 * 批量改写请求参数
 */
export interface BatchRewriteRequest {
  texts: string[];
  tone?: AITone;
  language?: AILanguage;
  preserveVariables?: boolean;
  model?: AIModel;
}

/**
 * 批量改写响应
 */
export interface BatchRewriteResponse {
  success: boolean;
  data: {
    results: Array<{
      original: string;
      rewritten: string;
      tone: string;
      language: string;
      model: string;
      tokensUsed: {
        prompt: number;
        completion: number;
        total: number;
      };
    }>;
    totalTokens: number;
  };
}

/**
 * 模板改写请求参数（带 KOL 上下文）
 */
export interface RewriteTemplateRequest {
  template: string;
  kolContext?: {
    username: string;
    displayName: string;
    bio?: string;
    category?: string;
    language?: string;
  };
  tone?: AITone;
  model?: AIModel;
}

/**
 * 模板改写响应
 */
export interface RewriteTemplateResponse {
  success: boolean;
  data: {
    original: string;
    rewritten: string;
    tone: string;
    language: string;
    model: string;
    tokensUsed: {
      prompt: number;
      completion: number;
      total: number;
    };
  };
}

/**
 * AI 服务健康检查响应
 */
export interface AIHealthCheckResponse {
  success: boolean;
  data: {
    healthy: boolean;
    model: string;
    latency: number;
    error?: string;
  };
}

/**
 * AI 风格选项
 */
export interface AIToneOption {
  value: AITone;
  label: string;
  description: string;
}

/**
 * AI 模型选项
 */
export interface AIModelOption {
  value: AIModel;
  label: string;
  description: string;
  cost: string;
}
