// UI 元素
const extractBtn = document.getElementById("extractBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");
const statusText = document.getElementById("statusText");
const countEl = document.getElementById("count");

// 状态管理
let collectedCount = 0;

// 初始化：恢复状态
async function initialize() {
  // 恢复数据
  chrome.storage.local.get(["collectedKOLs"], (result) => {
    if (result.collectedKOLs && result.collectedKOLs.length > 0) {
      collectedCount = result.collectedKOLs.length;
      updateUI();
    }
  });
}

// 执行初始化
initialize();

// 提取 KOL 数据 - 参考币安插件的提取逻辑
extractBtn.addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      alert("无法获取当前标签页");
      return;
    }

    if (
      !tab.url ||
      (!tab.url.includes("twitter.com") && !tab.url.includes("x.com"))
    ) {
      alert("请在 Twitter 页面使用此插件！\n当前页面: " + (tab.url || "未知"));
      return;
    }

    extractBtn.textContent = "⏳ 提取中...";
    extractBtn.disabled = true;
    statusText.textContent = "提取中...";
    statusEl.classList.add("active");

    // 注入 DOM 提取脚本
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content-twitter-extractor.js"],
      });

      console.log("DOM 提取脚本注入成功");
    } catch (err) {
      console.log("DOM 脚本可能已注入:", err.message);
    }

    // 等待一下，确保脚本加载
    setTimeout(() => {
      // 发送提取请求
      chrome.tabs.sendMessage(
        tab.id,
        { action: "extractFromTwitter" },
        (response) => {
          extractBtn.textContent = "捕获 KOL 数据";
          extractBtn.disabled = false;

          if (chrome.runtime.lastError) {
            statusText.textContent = "提取失败";
            statusEl.classList.remove("active");
            statusEl.classList.add("error");
            alert("提取失败：请刷新页面后重试");
          } else if (response && response.success) {
            statusText.textContent = "提取成功";
            statusEl.classList.remove("error");
            statusEl.classList.add("active");
          } else {
            statusText.textContent = "未找到数据";
            statusEl.classList.remove("active");
            statusEl.classList.add("error");
            alert(response?.message || '未找到数据，请确保在 Twitter 用户主页');
          }
        }
      );
    }, 500);
  } catch (error) {
    extractBtn.textContent = "捕获 KOL 数据";
    extractBtn.disabled = false;
    statusText.textContent = "发生错误";
    statusEl.classList.remove("active");
    statusEl.classList.add("error");
    alert("发生错误: " + error.message);
  }
});

// 清空数据 - 重置到插件初始状态
clearBtn.addEventListener("click", () => {
  if (confirm("确定清空数据？")) {
    chrome.storage.local.set({ collectedKOLs: [], kolIds: [] }, () => {
      // 重置计数器
      collectedCount = 0;
      updateUI();

      // 重置状态
      statusEl.classList.remove("active");
      statusEl.classList.remove("error");
      statusText.textContent = "就绪";
    });
  }
});

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateCount") {
    collectedCount = message.count;
    updateUI();
  }
});

function updateUI() {
  countEl.textContent = collectedCount;
}
