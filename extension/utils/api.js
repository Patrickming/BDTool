/**
 * API 调用模块
 * 封装所有与后端的通信逻辑
 */

const API = {
  /**
   * 创建单个 KOL
   */
  async createKOL(kolData) {
    const token = await chrome.storage.local.get('authToken');
    const apiUrl = await chrome.storage.local.get('apiUrl');
    const baseUrl = apiUrl.apiUrl || 'http://localhost:3000/api/v1';

    const response = await fetch(`${baseUrl}/kols`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.authToken}`
      },
      body: JSON.stringify(kolData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '创建 KOL 失败');
    }

    return response.json();
  },

  /**
   * 批量导入 KOL
   */
  async batchImportKOLs(usernames) {
    const token = await chrome.storage.local.get('authToken');
    const apiUrl = await chrome.storage.local.get('apiUrl');
    const baseUrl = apiUrl.apiUrl || 'http://localhost:3000/api/v1';

    const response = await fetch(`${baseUrl}/kols/batch/import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token.authToken}`
      },
      body: JSON.stringify({ inputs: usernames })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || '批量导入失败');
    }

    return response.json();
  },

  /**
   * 检查 KOL 是否已存在
   */
  async checkKOLExists(username) {
    const token = await chrome.storage.local.get('authToken');
    const apiUrl = await chrome.storage.local.get('apiUrl');
    const baseUrl = apiUrl.apiUrl || 'http://localhost:3000/api/v1';

    const response = await fetch(`${baseUrl}/kols?search=${username}&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.authToken}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    const kols = result.data?.kols || [];

    return kols.find(k => k.username === username) || null;
  },

  /**
   * 测试认证状态
   */
  async testAuth() {
    const token = await chrome.storage.local.get('authToken');
    const apiUrl = await chrome.storage.local.get('apiUrl');
    const baseUrl = apiUrl.apiUrl || 'http://localhost:3000/api/v1';

    if (!token.authToken) {
      throw new Error('未找到认证 Token');
    }

    const response = await fetch(`${baseUrl}/kols?limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.authToken}`
      }
    });

    if (!response.ok) {
      throw new Error('认证失败');
    }

    return true;
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
