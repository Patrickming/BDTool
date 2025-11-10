// Background Script: 数据上传

// API 配置
const API_BASE_URL = "http://localhost:3000/api/v1";

// 点击扩展图标时打开侧边栏
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "uploadKOLs") {
    uploadKOLs(message.kols).then(sendResponse);
    return true; // 保持消息通道开启
  }
});

// 批量上传 KOL 到数据库
async function uploadKOLs(kols) {
  console.log(`📤 准备上传 ${kols.length} 个 KOL 到数据库...`);

  // 获取 Extension Token
  const result = await chrome.storage.local.get(["extensionToken"]);
  const extensionToken = result.extensionToken;

  if (!extensionToken) {
    console.error("❌ 未配置 Extension Token");
    return {
      success: false,
      successCount: 0,
      failedCount: kols.length,
      errors: [],
      message: "未配置 Extension Token，请先在插件中配置 Token",
    };
  }

  let successCount = 0;
  let failedCount = 0;
  let duplicateCount = 0;
  const errors = [];
  const duplicates = [];

  for (const kol of kols) {
    try {
      console.log(`📤 上传: @${kol.username}`);

      const response = await fetch(`${API_BASE_URL}/kols`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Extension-Token": extensionToken, // 使用 Extension Token 认证
        },
        body: JSON.stringify({
          username: kol.username,
          displayName: kol.displayName,
          twitterId: kol.username, // 使用 username 作为 twitterId
          bio: kol.bio,
          followerCount: kol.followerCount,
          followingCount: kol.followingCount,
          profileImgUrl: kol.profileImgUrl,
          verified: kol.verified,
          // 手动填写的字段
          qualityScore: kol.qualityScore,
          contentCategory: kol.contentCategory,
          status: kol.status,
          customNotes: kol.customNotes,
        }),
      });

      if (response.ok) {
        const savedKOL = await response.json();
        console.log(`✅ 成功上传: @${kol.username}`);
        successCount++;
      } else {
        let error;
        try {
          error = await response.json();
        } catch (e) {
          error = { message: `HTTP ${response.status}: ${response.statusText}` };
        }
        console.error(`❌ 上传失败 @${kol.username}:`, error);

        // Token 认证失败或过期
        if (response.status === 401) {
          return {
            success: false,
            successCount,
            failedCount: kols.length - successCount,
            duplicateCount,
            errors: ["Token 已过期或无效，请重新配置"],
            duplicates,
            message: "Token 已过期或无效，请在插件中重新配置 Token",
          };
        }

        // 如果是重复数据，单独统计
        if (response.status === 400 && error.message?.includes("已存在")) {
          console.log(`⚠️ @${kol.username} 已存在于数据库中`);
          duplicateCount++;
          duplicates.push(`@${kol.username}`);
        } else {
          failedCount++;
          const errorMsg = error.message || error.error || `HTTP ${response.status}`;
          errors.push(`@${kol.username}: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error(`❌ 上传异常 @${kol.username}:`, error);
      failedCount++;
      const errorMsg = error.message || String(error);
      errors.push(`@${kol.username}: ${errorMsg}`);
    }
  }

  console.log(`✅ 上传完成: 成功 ${successCount}, 重复 ${duplicateCount}, 失败 ${failedCount}`);

  // 构建详细的消息
  let message = "";
  if (successCount > 0) {
    message += `成功上传 ${successCount} 个`;
  }
  if (duplicateCount > 0) {
    if (message) message += ", ";
    message += `${duplicateCount} 个已存在 (${duplicates.join(', ')})`;
  }
  if (failedCount > 0) {
    if (message) message += ", ";
    message += `${failedCount} 个失败`;
  }
  if (!message) {
    message = "没有数据需要上传";
  }

  // 如果有重复，添加提示
  if (duplicateCount > 0) {
    message += "\n\n提示：重复的 KOL 未修改，如需修改请到系统中操作";
  }

  return {
    success: failedCount === 0,
    successCount,
    failedCount,
    duplicateCount,
    errors,
    duplicates,
    message,
  };
}
