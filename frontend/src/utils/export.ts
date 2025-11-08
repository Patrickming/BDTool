/**
 * CSV 导出工具函数
 */

import Papa from 'papaparse';
import { KOL, KOLStatusConfig, ContentCategoryConfig } from '@/types/kol';

/**
 * 导出 KOL 列表为 CSV 文件
 */
export const exportKOLsToCSV = (kols: KOL[], filename?: string) => {
  // 转换 KOL 数据为 CSV 格式
  const csvData = kols.map((kol) => ({
    '用户名': kol.username,
    '显示名称': kol.displayName,
    '粉丝数': kol.followerCount,
    '关注数': kol.followingCount,
    '状态': KOLStatusConfig[kol.status].label,
    '内容分类': ContentCategoryConfig[kol.contentCategory].label,
    '质量分': kol.qualityScore,
    '是否认证': kol.verified ? '是' : '否',
    '语言': kol.language || '',
    '个人简介': kol.bio || '',
    'Twitter ID': kol.twitterId || '',
    '头像 URL': kol.profileImgUrl || '',
    '最后推文日期': kol.lastTweetDate || '',
    '账号创建日期': kol.accountCreated || '',
    '备注': kol.customNotes || '',
    '创建时间': new Date(kol.createdAt).toLocaleString('zh-CN'),
    '更新时间': new Date(kol.updatedAt).toLocaleString('zh-CN'),
  }));

  // 使用 Papa Parse 生成 CSV 字符串
  const csv = Papa.unparse(csvData, {
    quotes: true, // 所有字段加引号
    header: true, // 包含表头
    delimiter: ',', // 分隔符
    newline: '\n', // 换行符
    skipEmptyLines: false, // 保留空行
  });

  // 添加 BOM 头以确保 Excel 正确显示中文
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csv;

  // 创建 Blob 对象
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });

  // 生成文件名（包含时间戳）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const finalFilename = filename || `KOL导出_${timestamp}.csv`;

  // 触发下载
  downloadBlob(blob, finalFilename);
};

/**
 * 下载 Blob 对象为文件
 */
const downloadBlob = (blob: Blob, filename: string) => {
  // 创建临时 URL
  const url = window.URL.createObjectURL(blob);

  // 创建隐藏的 <a> 元素
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  // 添加到 DOM 并触发点击
  document.body.appendChild(link);
  link.click();

  // 清理
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * 格式化数字（带千分位）
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

/**
 * 转义 CSV 特殊字符
 */
export const escapeCsvValue = (value: string | null | undefined): string => {
  if (!value) return '';

  // 转义双引号
  let escaped = value.replace(/"/g, '""');

  // 如果包含逗号、换行符或双引号，则需要用双引号包裹
  if (escaped.includes(',') || escaped.includes('\n') || escaped.includes('"')) {
    escaped = `"${escaped}"`;
  }

  return escaped;
};
