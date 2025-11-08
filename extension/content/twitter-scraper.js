/**
 * Twitter 数据提取模块
 * 负责从 Twitter 页面提取用户资料数据
 */

const TwitterScraper = {
  /**
   * 提取当前用户的完整资料
   */
  extractUserProfile() {
    try {
      // 等待页面加载
      if (!this.isProfilePage()) {
        return null;
      }

      const profile = {
        username: this.extractUsername(),
        displayName: this.extractDisplayName(),
        bio: this.extractBio(),
        followerCount: this.extractFollowerCount(),
        followingCount: this.extractFollowingCount(),
        profileImgUrl: this.extractAvatar(),
        verified: this.isVerified(),
        twitterId: this.extractTwitterId()
      };

      return profile;
    } catch (error) {
      console.error('[KOL BD Tool] 提取用户资料失败:', error);
      return null;
    }
  },

  /**
   * 检查是否为个人主页
   */
  isProfilePage() {
    return window.location.pathname.match(/^\/[\w]+$/);
  },

  /**
   * 提取用户名
   */
  extractUsername() {
    // 方法1: 从 URL 提取
    const match = window.location.pathname.match(/^\/([\w]+)$/);
    if (match) {
      return match[1];
    }

    // 方法2: 从页面元素提取
    const usernameElement = document.querySelector('[data-testid="UserName"]');
    if (usernameElement) {
      const spans = usernameElement.querySelectorAll('span');
      for (const span of spans) {
        if (span.textContent.startsWith('@')) {
          return span.textContent.substring(1);
        }
      }
    }

    return null;
  },

  /**
   * 提取显示名
   */
  extractDisplayName() {
    const element = document.querySelector('[data-testid="UserName"] > div:first-child span');
    return element ? element.textContent.trim() : null;
  },

  /**
   * 提取个人简介
   */
  extractBio() {
    const element = document.querySelector('[data-testid="UserDescription"]');
    return element ? element.textContent.trim() : null;
  },

  /**
   * 提取粉丝数
   */
  extractFollowerCount() {
    try {
      // 查找包含 "Followers" 或 "关注者" 的链接
      const links = document.querySelectorAll('a[href$="/verified_followers"], a[href$="/followers"]');

      for (const link of links) {
        const text = link.textContent;
        // 提取数字（支持 K, M 等单位）
        const match = text.match(/([\d.,]+)\s*([KMB]?)\s*(Followers|关注者)/i);
        if (match) {
          return this.parseNumber(match[1], match[2]);
        }
      }

      return 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * 提取关注数
   */
  extractFollowingCount() {
    try {
      const links = document.querySelectorAll('a[href$="/following"]');

      for (const link of links) {
        const text = link.textContent;
        const match = text.match(/([\d.,]+)\s*([KMB]?)\s*(Following|正在关注)/i);
        if (match) {
          return this.parseNumber(match[1], match[2]);
        }
      }

      return 0;
    } catch (error) {
      return 0;
    }
  },

  /**
   * 提取头像 URL
   */
  extractAvatar() {
    const img = document.querySelector('[data-testid="UserAvatar-Container-"] img, a[href*="/photo"] img');
    return img ? img.src : null;
  },

  /**
   * 检查是否认证
   */
  isVerified() {
    return !!document.querySelector('svg[aria-label*="Verified"], svg[aria-label*="已验证"]');
  },

  /**
   * 提取 Twitter ID（从 API 响应中获取）
   */
  extractTwitterId() {
    // Twitter ID 通常需要从 API 响应中获取
    // 这里暂时返回 null，后续可以通过监听网络请求获取
    return null;
  },

  /**
   * 解析数字（支持 K, M, B 等单位）
   */
  parseNumber(numStr, unit) {
    const num = parseFloat(numStr.replace(/,/g, ''));

    switch (unit.toUpperCase()) {
      case 'K':
        return Math.round(num * 1000);
      case 'M':
        return Math.round(num * 1000000);
      case 'B':
        return Math.round(num * 1000000000);
      default:
        return Math.round(num);
    }
  },

  /**
   * 批量提取可见用户列表
   * 用于关注列表、粉丝列表等页面
   */
  extractVisibleUsers() {
    try {
      const users = [];
      // 查找所有用户单元格
      const userCells = document.querySelectorAll('[data-testid="UserCell"]');

      userCells.forEach(cell => {
        try {
          const usernameElement = cell.querySelector('[data-testid="User-Name"] a[role="link"]');
          if (!usernameElement) return;

          const href = usernameElement.getAttribute('href');
          const match = href.match(/^\/([\w]+)$/);
          if (!match) return;

          const username = match[1];

          // 提取显示名
          const displayNameElement = cell.querySelector('[data-testid="User-Name"] > div:first-child span');
          const displayName = displayNameElement ? displayNameElement.textContent.trim() : username;

          // 提取简介
          const bioElement = cell.querySelector('[data-testid*="UserDescription"]');
          const bio = bioElement ? bioElement.textContent.trim() : null;

          users.push({
            username,
            displayName,
            bio
          });
        } catch (err) {
          // 忽略单个用户提取失败
        }
      });

      return users;
    } catch (error) {
      console.error('[KOL BD Tool] 批量提取用户失败:', error);
      return [];
    }
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TwitterScraper;
}
