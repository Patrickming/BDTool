/**
 * 导出工具函数
 */

import * as XLSX from 'xlsx';
import { KOL, KOLStatusConfig, ContentCategoryConfig } from '@/types/kol';

/**
 * 导出 KOL 列表为 Excel 文件
 */
export const exportKOLsToCSV = (kols: KOL[], filename?: string) => {
  // 转换 KOL 数据为表格格式
  const excelData = kols.map((kol) => ({
    '用户名': kol.username,
    '显示名称': kol.displayName,
    '粉丝数': kol.followerCount,
    '关注数': kol.followingCount || 0,
    '状态': KOLStatusConfig[kol.status].label,
    '内容分类': ContentCategoryConfig[kol.contentCategory].label,
    '质量分': kol.qualityScore,
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

  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // 设置列宽
  const colWidths = [
    { wch: 15 }, // 用户名
    { wch: 20 }, // 显示名称
    { wch: 12 }, // 粉丝数
    { wch: 12 }, // 关注数
    { wch: 12 }, // 状态
    { wch: 15 }, // 内容分类
    { wch: 10 }, // 质量分
    { wch: 10 }, // 语言
    { wch: 30 }, // 个人简介
    { wch: 15 }, // Twitter ID
    { wch: 50 }, // 头像 URL
    { wch: 15 }, // 最后推文日期
    { wch: 15 }, // 账号创建日期
    { wch: 30 }, // 备注
    { wch: 20 }, // 创建时间
    { wch: 20 }, // 更新时间
  ];
  worksheet['!cols'] = colWidths;

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'KOL列表');

  // 生成文件名（包含时间戳）
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const finalFilename = filename || `KOL导出_${timestamp}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, finalFilename);
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
