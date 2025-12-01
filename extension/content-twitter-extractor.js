// Twitter KOL 数据提取器
(function () {
  if (window.__TWITTER_KOL_EXTRACTOR_INJECTED__) {
    console.log("⚠️ Twitter 提取脚本已运行");
    return;
  }
  window.__TWITTER_KOL_EXTRACTOR_INJECTED__ = true;

  console.log("✅✅✅ Twitter KOL 提取器已启动 ✅✅✅");
  console.log("📍 当前页面URL:", window.location.href);
  console.log("📍 时间:", new Date().toLocaleString());

  // 解析数字 (处理 K, M, B 单位)
  function parseNumber(text) {
    if (!text) return 0;

    // 移除逗号
    text = text.replace(/,/g, "").trim();

    const match = text.match(/([\d.]+)([KMB])?/i);
    if (!match) return 0;

    const num = parseFloat(match[1]);
    const unit = match[2]?.toUpperCase();

    if (unit === "K") return Math.round(num * 1000);
    if (unit === "M") return Math.round(num * 1000000);
    if (unit === "B") return Math.round(num * 1000000000);

    return Math.round(num);
  }

  // 从 Twitter 页面提取用户资料
  function extractUserProfile() {
    console.log("🔍 开始提取 Twitter 用户资料...");

    const profileData = {
      username: "",
      displayName: "",
      bio: "",
      followerCount: 0,
      followingCount: 0,
      profileImgUrl: "",
      verified: false,
    };

    try {
      // 提取用户名 (从 URL 或页面)
      const urlMatch = window.location.href.match(/\/([\w]+)(?:\/|$|\?)/);
      if (urlMatch) {
        profileData.username = urlMatch[1];
        console.log("✅ 从URL提取用户名:", profileData.username);
      }

      // 提取显示名称
      const displayNameEl =
        document.querySelector('[data-testid="UserName"] span') ||
        document.querySelector('[data-testid="UserDescription"] + div span');
      if (displayNameEl) {
        profileData.displayName = displayNameEl.textContent.trim();
        console.log("✅ 提取显示名:", profileData.displayName);
      }

      // 提取个人简介
      const bioEl = document.querySelector('[data-testid="UserDescription"]');
      if (bioEl) {
        profileData.bio = bioEl.textContent.trim();
        console.log("✅ 提取简介:", profileData.bio.substring(0, 50) + "...");
      }

      // 提取粉丝数和关注数
      const statsLinks = document.querySelectorAll('a[href*="/verified_followers"], a[href*="/followers"], a[href*="/following"]');

      statsLinks.forEach((link) => {
        const text = link.textContent.trim();
        const href = link.getAttribute("href");

        if (href.includes("/followers") || href.includes("/verified_followers")) {
          const match = text.match(/([\d.,KMB]+)\s*(?:粉丝|Followers?)/i);
          if (match) {
            profileData.followerCount = parseNumber(match[1]);
            console.log("✅ 提取粉丝数:", profileData.followerCount);
          }
        } else if (href.includes("/following")) {
          const match = text.match(/([\d.,KMB]+)\s*(?:正在关注|Following)/i);
          if (match) {
            profileData.followingCount = parseNumber(match[1]);
            console.log("✅ 提取关注数:", profileData.followingCount);
          }
        }
      });

      // 备用方案：查找包含数字的 span
      if (profileData.followerCount === 0 || profileData.followingCount === 0) {
        const statElements = document.querySelectorAll('[href*="/followers"], [href*="/following"]');
        statElements.forEach((el) => {
          const spanText = el.textContent;
          const href = el.getAttribute("href");

          if (href?.includes("/followers") && profileData.followerCount === 0) {
            const numberMatch = spanText.match(/([\d.,KMB]+)/);
            if (numberMatch) {
              profileData.followerCount = parseNumber(numberMatch[1]);
              console.log("✅ (备用) 提取粉丝数:", profileData.followerCount);
            }
          } else if (href?.includes("/following") && profileData.followingCount === 0) {
            const numberMatch = spanText.match(/([\d.,KMB]+)/);
            if (numberMatch) {
              profileData.followingCount = parseNumber(numberMatch[1]);
              console.log("✅ (备用) 提取关注数:", profileData.followingCount);
            }
          }
        });
      }

      // 提取头像
      const avatarEl =
        document.querySelector('[data-testid="UserAvatar-Container-' + profileData.username + '"] img') ||
        document.querySelector('img[src*="profile_images"]');
      if (avatarEl) {
        profileData.profileImgUrl = avatarEl.src.replace(/_normal\./, "_400x400.");
        console.log("✅ 提取头像URL");
      }

      // 检测认证状态
      const verifiedEl = document.querySelector('[data-testid="icon-verified"], [aria-label*="认证"], [aria-label*="Verified"]');
      profileData.verified = !!verifiedEl;
      console.log("✅ 认证状态:", profileData.verified);

    } catch (err) {
      console.error("❌ 提取过程出错:", err);
    }

    // 验证数据完整性 - username 是必需的，displayName 可以为空（会使用 username）
    if (!profileData.username) {
      console.warn("⚠️ 缺少用户名，数据不完整");
      return null;
    }

    // 如果 displayName 为空（包括只有空格或被过滤的情况），使用 username 作为 displayName
    if (!profileData.displayName || profileData.displayName.trim() === '') {
      console.log("ℹ️ displayName 为空，使用 username 作为 displayName");
      profileData.displayName = profileData.username;
    }

    console.log("🎉 用户资料提取完成:", profileData);
    return profileData;
  }

  // 主提取函数
  window.extractTwitterKOL = function () {
    console.log("🚀🚀🚀 开始提取 Twitter KOL 数据 🚀🚀🚀");

    const profile = extractUserProfile();

    if (profile) {
      console.log(`🎉🎉🎉 成功提取用户: @${profile.username}`);

      // 发送到 background
      chrome.runtime.sendMessage(
        {
          action: "collectKOL",
          kol: profile,
        },
        (response) => {
          console.log("✅ 数据已发送到后台");
        }
      );

      return { success: true, data: profile };
    }

    console.log("❌ 未能提取到有效的用户数据");
    console.log("💡 提示：请确保在 Twitter 个人主页，并且页面已完全加载");

    return { success: false, message: "未找到用户数据" };
  };

  // 监听来自 popup 的消息
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "extractFromTwitter") {
      console.log("📨 收到提取请求");
      const result = window.extractTwitterKOL();
      sendResponse(result);
      return true;
    }
  });

  console.log("📡 Twitter KOL 提取器准备就绪！");
  console.log("💡 调用 window.extractTwitterKOL() 即可提取当前页面的用户资料");
})();
