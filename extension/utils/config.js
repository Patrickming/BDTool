/**
 * 配置管理模块
 */

const CONFIG = {
  // API 基础 URL
  API_BASE_URL: 'http://localhost:3000/api/v1',

  // 本地存储键名
  STORAGE_KEYS: {
    AUTH_TOKEN: 'authToken',
    USER_INFO: 'userInfo',
    API_URL: 'apiUrl'
  },

  // Twitter 选择器（用于数据提取）
  TWITTER_SELECTORS: {
    USERNAME: '[data-testid="UserName"]',
    DISPLAY_NAME: '[data-testid="UserName"] > div:first-child',
    FOLLOWER_COUNT: 'a[href$="/verified_followers"] span[class*="css-"] span',
    FOLLOWING_COUNT: 'a[href$="/following"] span[class*="css-"] span',
    BIO: '[data-testid="UserDescription"]',
    AVATAR: '[data-testid="UserAvatar-Container-"] img',
    VERIFIED_BADGE: '[aria-label*="Verified"]',
    PROFILE_HEADER: '[data-testid="UserProfileHeader_Items"]'
  },

  // KOL 状态选项
  KOL_STATUS: {
    NEW: 'new',
    CONTACTED: 'contacted',
    REPLIED: 'replied',
    NEGOTIATING: 'negotiating',
    COOPERATING: 'cooperating',
    REJECTED: 'rejected',
    NOT_INTERESTED: 'not_interested'
  },

  // 内容分类选项
  CONTENT_CATEGORY: {
    CONTRACT_TRADING: 'contract_trading',
    CRYPTO_TRADING: 'crypto_trading',
    WEB3: 'web3',
    UNKNOWN: 'unknown'
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
