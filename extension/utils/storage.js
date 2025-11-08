/**
 * 本地存储管理模块
 * 使用 Chrome Storage API 进行数据持久化
 */

const Storage = {
  /**
   * 保存认证 Token
   */
  async saveAuthToken(token) {
    return chrome.storage.local.set({ authToken: token });
  },

  /**
   * 获取认证 Token
   */
  async getAuthToken() {
    const result = await chrome.storage.local.get('authToken');
    return result.authToken || null;
  },

  /**
   * 保存用户信息
   */
  async saveUserInfo(userInfo) {
    return chrome.storage.local.set({ userInfo });
  },

  /**
   * 获取用户信息
   */
  async getUserInfo() {
    const result = await chrome.storage.local.get('userInfo');
    return result.userInfo || null;
  },

  /**
   * 保存 API 基础 URL
   */
  async saveApiUrl(apiUrl) {
    return chrome.storage.local.set({ apiUrl });
  },

  /**
   * 获取 API 基础 URL
   */
  async getApiUrl() {
    const result = await chrome.storage.local.get('apiUrl');
    return result.apiUrl || 'http://localhost:3000/api/v1';
  },

  /**
   * 清除所有存储数据
   */
  async clear() {
    return chrome.storage.local.clear();
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
