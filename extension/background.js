// Background Script: 数据上传

// API 配置
const API_BASE_URL = "http://localhost:3000/api/v1";

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

  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const kol of kols) {
    try {
      console.log(`📤 上传: @${kol.username}`);

      const response = await fetch(`${API_BASE_URL}/kols`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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

        // 如果是重复数据，也算成功
        if (response.status === 409 || error.message?.includes("已存在")) {
          console.log(`⏭️ @${kol.username} 已存在于数据库`);
          successCount++;
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

  console.log(`✅ 上传完成: 成功 ${successCount}, 失败 ${failedCount}`);

  return {
    success: failedCount === 0,
    successCount,
    failedCount,
    errors,
    message: failedCount > 0 ? `部分上传失败: ${errors.join(', ')}` : '全部上传成功',
  };
}
