// Background Script: 数据收集和 API 调用

// API 配置
const API_BASE_URL = "http://localhost:3000/api/v1";

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "collectKOL") {
    collectKOL(message.kol);
  }
});

// 收集 KOL 数据并保存到后端
async function collectKOL(kolData) {
  console.log("📥 收到 KOL 数据:", kolData);

  try {
    // 1. 保存到本地存储(用于显示计数)
    const result = await chrome.storage.local.get(["collectedKOLs", "kolIds"]);

    let allKOLs = result.collectedKOLs || [];
    let kolIds = new Set(result.kolIds || []);

    // 去重检查
    const kolId = kolData.username;
    if (kolIds.has(kolId)) {
      console.log("⏭️ KOL 已存在，跳过:", kolId);
      return;
    }

    // 2. 发送到后端 API
    console.log("📤 发送到后端 API...");
    const response = await fetch(`${API_BASE_URL}/kols`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: kolData.username,
        displayName: kolData.displayName,
        bio: kolData.bio,
        followerCount: kolData.followerCount,
        followingCount: kolData.followingCount,
        profileImgUrl: kolData.profileImgUrl,
        verified: kolData.verified,
        platform: "twitter",
        platformId: kolData.username,
      }),
    });

    if (response.ok) {
      const savedKOL = await response.json();
      console.log("✅ 成功保存到后端:", savedKOL);

      // 3. 保存到本地
      kolIds.add(kolId);
      allKOLs.push(kolData);

      await chrome.storage.local.set({
        collectedKOLs: allKOLs,
        kolIds: Array.from(kolIds),
      });

      // 4. 通知 popup 更新计数
      chrome.runtime.sendMessage({
        action: "updateCount",
        count: allKOLs.length,
      });

      console.log(`✅ 新增 1 个 KOL，总计 ${allKOLs.length} 个`);
    } else {
      const error = await response.json();
      console.error("❌ 后端保存失败:", error);

      // 如果是重复数据错误，也视为成功
      if (response.status === 409 || error.message?.includes("已存在")) {
        console.log("⏭️ KOL 已存在于后端");

        // 仍然保存到本地
        kolIds.add(kolId);
        allKOLs.push(kolData);

        await chrome.storage.local.set({
          collectedKOLs: allKOLs,
          kolIds: Array.from(kolIds),
        });

        chrome.runtime.sendMessage({
          action: "updateCount",
          count: allKOLs.length,
        });
      }
    }
  } catch (error) {
    console.error("❌ 收集 KOL 失败:", error);
  }
}
