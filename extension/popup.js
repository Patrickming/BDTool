// UI 元素
const extractBtn = document.getElementById("extractBtn");
const viewBtn = document.getElementById("viewBtn");
const uploadBtn = document.getElementById("uploadBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");
const statusText = document.getElementById("statusText");
const countEl = document.getElementById("count");
const pageDetectionEl = document.getElementById("pageDetection");
const pageType = document.getElementById("pageType");

// Token 相关元素
const tokenStatusEl = document.getElementById("tokenStatus");
const tokenStatusText = document.getElementById("tokenStatusText");
const configTokenBtn = document.getElementById("configTokenBtn");
const tokenModal = document.getElementById("tokenModal");
const closeTokenModalBtn = document.getElementById("closeTokenModalBtn");
const tokenInput = document.getElementById("tokenInput");
const saveTokenBtn = document.getElementById("saveTokenBtn");

// 弹窗元素
const dataModal = document.getElementById("dataModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const kolListContainer = document.getElementById("kolListContainer");
const saveEditsBtn = document.getElementById("saveEditsBtn");

// 状态管理
let collectedCount = 0;
let localKOLs = []; // 本地待上传的 KOL 数据
let extensionToken = null; // Extension Token

// 初始化：恢复状态 + 检测页面
async function initialize() {
  // 恢复本地数据
  chrome.storage.local.get(["pendingKOLs", "extensionToken"], (result) => {
    if (result.pendingKOLs && result.pendingKOLs.length > 0) {
      localKOLs = result.pendingKOLs;
      collectedCount = localKOLs.length;
      updateUI();
    }

    // 恢复 Token
    if (result.extensionToken) {
      extensionToken = result.extensionToken;
      updateTokenUI(true);
    } else {
      updateTokenUI(false);
    }
  });

  // 检测当前页面
  await detectCurrentPage();
}

// 更新 Token UI
function updateTokenUI(hasToken) {
  if (hasToken) {
    tokenStatusText.textContent = "✅ Token 已配置";
    tokenStatusText.style.color = "#51cf66";
    tokenStatusEl.classList.add("active");
    configTokenBtn.textContent = "重新配置";
  } else {
    tokenStatusText.textContent = "❌ 未配置 Token";
    tokenStatusText.style.color = "#ff6b6b";
    tokenStatusEl.classList.remove("active");
    configTokenBtn.textContent = "配置 Token";
  }
}

// 执行初始化
initialize();

// 监听标签页更新（实时检测页面变化）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 当 URL 变化或页面加载完成时重新检测
  if (changeInfo.url || changeInfo.status === 'complete') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id === tabId) {
        detectCurrentPage();
      }
    });
  }
});

// 监听标签页切换（用户切换到不同的标签页）
chrome.tabs.onActivated.addListener(() => {
  detectCurrentPage();
});

// 检测当前页面类型
async function detectCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab || !tab.url) {
      pageType.textContent = "❌ 无法访问此页面";
      pageDetectionEl.classList.remove("active");
      extractBtn.disabled = true;
      return;
    }

    // 严格检测 URL 格式: https://x.com/用户ID 或 https://twitter.com/用户ID
    const userPagePattern = /^https:\/\/(x\.com|twitter\.com)\/([\w]+)$/;
    const match = tab.url.match(userPagePattern);

    if (match) {
      const username = match[2];
      // 排除 Twitter 的功能页面
      if (
        ![
          "home",
          "explore",
          "notifications",
          "messages",
          "search",
          "settings",
          "compose",
        ].includes(username)
      ) {
        pageType.textContent = `✅ Twitter 主页 (@${username})`;
        pageDetectionEl.classList.add("active");
        extractBtn.disabled = false;
      } else {
        pageType.textContent = "📍 非 KOL 主页";
        pageDetectionEl.classList.remove("active");
        extractBtn.disabled = true;
      }
    } else {
      pageType.textContent = "❌ 非 KOL 主页";
      pageDetectionEl.classList.remove("active");
      extractBtn.disabled = true;
    }
  } catch (error) {
    pageType.textContent = "❌ 检测失败";
    pageDetectionEl.classList.remove("active");
    extractBtn.disabled = true;
  }
}

// 捕获 KOL 数据 - 保存到本地
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

    // 等待脚本加载
    setTimeout(() => {
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
            // 提取成功，保存到本地
            const kolData = {
              ...response.data,
              // 添加需要手动填写的字段（默认值）
              qualityScore: null, // 质量评分 (0-100)
              contentCategory: null, // 内容分类 (枚举值)
              language: response.data.language || "en", // 语言 (默认英语)
              status: "new", // 状态 (默认 new)
              customNotes: "", // 自定义备注
              capturedAt: new Date().toISOString(),
            };

            // 检查是否已存在
            const exists = localKOLs.some(
              (k) => k.username === kolData.username
            );
            if (exists) {
              alert(`@${kolData.username} 已在待上传列表中`);
              statusText.textContent = "已存在";
              statusEl.classList.remove("active");
              return;
            }

            // 添加到本地列表
            localKOLs.push(kolData);
            collectedCount = localKOLs.length;

            // 保存到 storage
            chrome.storage.local.set({ pendingKOLs: localKOLs }, () => {
              statusText.textContent = "已保存到本地";
              statusEl.classList.remove("error");
              statusEl.classList.add("active");
              updateUI();
            });
          } else {
            statusText.textContent = "未找到数据";
            statusEl.classList.remove("active");
            statusEl.classList.add("error");
            alert(response?.message || "未找到数据，请确保在 Twitter 用户主页");
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

// 查看数据 - 打开编辑弹窗
viewBtn.addEventListener("click", () => {
  if (localKOLs.length === 0) {
    alert("没有待上传的数据");
    return;
  }

  renderKOLList();
  dataModal.style.display = "flex";
  dataModal.style.alignItems = "center";
  dataModal.style.justifyContent = "center";
});

// 渲染 KOL 列表
function renderKOLList() {
  let html = "";

  localKOLs.forEach((kol, index) => {
    html += `
      <div style="margin-bottom: 16px; padding: 12px; background: #2b3139; border-radius: 8px; border-left: 4px solid #667eea;">
        <div style="display: flex; align-items: center; margin-bottom: 8px;">
          ${
            kol.profileImgUrl
              ? `<img src="${kol.profileImgUrl}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;">`
              : ""
          }
          <div style="flex: 1;">
            <div style="color: #fff; font-weight: bold;">@${kol.username}</div>
            <div style="color: #999; font-size: 12px;">${kol.displayName}</div>
          </div>
          <div style="text-align: right; font-size: 12px; color: #999;">
            <div>粉丝: ${kol.followerCount?.toLocaleString() || 0}</div>
            <div>关注: ${kol.followingCount?.toLocaleString() || 0}</div>
          </div>
        </div>

        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #444;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px;">
            <div>
              <label style="color: #999; font-size: 12px; display: block; margin-bottom: 4px;">
                质量评分 <span style="color: #ff6b6b;">*</span>
              </label>
              <input
                type="number"
                id="quality_${index}"
                min="1"
                max="5"
                value="${kol.qualityScore || ""}"
                placeholder="0-100"
                style="width: 100%; padding: 6px; background: #1e2329; border: 1px solid #444; border-radius: 4px; color: #fff;"
              />
            </div>
            <div>
              <label style="color: #999; font-size: 12px; display: block; margin-bottom: 4px;">
                内容分类 <span style="color: #ff6b6b;">*</span>
              </label>
              <select
                id="category_${index}"
                style="width: 100%; padding: 6px; background: #1e2329; border: 1px solid #444; border-radius: 4px; color: #fff;"
              >
                <option value="">请选择</option>
                <option value="contract_trading" ${
                  kol.contentCategory === "contract_trading" ? "selected" : ""
                }>合约交易分析</option>
                <option value="crypto_trading" ${
                  kol.contentCategory === "crypto_trading" ? "selected" : ""
                }>代币交易分析</option>
                <option value="web3" ${
                  kol.contentCategory === "web3" ? "selected" : ""
                }>Web3 通用</option>
                <option value="unknown" ${
                  kol.contentCategory === "unknown" ? "selected" : ""
                }>未分类</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 8px;">
            <label style="color: #999; font-size: 12px; display: block; margin-bottom: 4px;">
              语言
            </label>
            <select
              id="language_${index}"
              style="width: 100%; padding: 6px; background: #1e2329; border: 1px solid #444; border-radius: 4px; color: #fff;"
            >
              <option value="en" ${
                (kol.language === "en" || !kol.language) ? "selected" : ""
              }>🇺🇸 英语</option>
              <option value="ja" ${
                kol.language === "ja" ? "selected" : ""
              }>🇯🇵 日语</option>
              <option value="ko" ${
                kol.language === "ko" ? "selected" : ""
              }>🇰🇷 韩语</option>
              <option value="fr" ${
                kol.language === "fr" ? "selected" : ""
              }>🇫🇷 法语</option>
              <option value="de" ${
                kol.language === "de" ? "selected" : ""
              }>🇩🇪 德语</option>
              <option value="ru" ${
                kol.language === "ru" ? "selected" : ""
              }>🇷🇺 俄语</option>
              <option value="hi" ${
                kol.language === "hi" ? "selected" : ""
              }>🇮🇳 印地语</option>
              <option value="es" ${
                kol.language === "es" ? "selected" : ""
              }>🇪🇸 西班牙语</option>
              <option value="pt" ${
                kol.language === "pt" ? "selected" : ""
              }>🇵🇹 葡萄牙语</option>
            </select>
          </div>

          <div>
            <label style="color: #999; font-size: 12px; display: block; margin-bottom: 4px;">
              自定义备注
            </label>
            <textarea
              id="notes_${index}"
              placeholder="添加备注信息..."
              style="width: 100%; padding: 6px; background: #1e2329; border: 1px solid #444; border-radius: 4px; color: #fff; min-height: 60px; resize: vertical;"
            >${kol.customNotes || ""}</textarea>
          </div>

          <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #999;">状态: ${
              kol.status
            }</span>
            <button
              onclick="removeKOL(${index})"
              style="padding: 4px 12px; background: #3a1a1a; color: #ff6b6b; border: 1px solid #ff6b6b; border-radius: 4px; cursor: pointer; font-size: 12px;"
            >
              移除
            </button>
          </div>
        </div>
      </div>
    `;
  });

  kolListContainer.innerHTML = html;
}

// 移除 KOL（全局函数）
window.removeKOL = function (index) {
  if (confirm(`确定移除 @${localKOLs[index].username}?`)) {
    localKOLs.splice(index, 1);
    collectedCount = localKOLs.length;
    chrome.storage.local.set({ pendingKOLs: localKOLs }, () => {
      renderKOLList();
      updateUI();
      if (localKOLs.length === 0) {
        dataModal.style.display = "none";
      }
    });
  }
};

// 保存编辑
saveEditsBtn.addEventListener("click", () => {
  // 收集所有输入的数据
  localKOLs.forEach((kol, index) => {
    const qualityInput = document.getElementById(`quality_${index}`);
    const categoryInput = document.getElementById(`category_${index}`);
    const languageInput = document.getElementById(`language_${index}`);
    const notesInput = document.getElementById(`notes_${index}`);

    kol.qualityScore = qualityInput.value ? parseInt(qualityInput.value) : null;
    kol.contentCategory = categoryInput.value || null;
    kol.language = languageInput.value || 'en';
    kol.customNotes = notesInput.value.trim() || "";
  });

  // 保存到 storage
  chrome.storage.local.set({ pendingKOLs: localKOLs }, () => {
    dataModal.style.display = "none";
    updateUI();
  });
});

// 关闭弹窗
closeModalBtn.addEventListener("click", () => {
  dataModal.style.display = "none";
});

dataModal.addEventListener("click", (e) => {
  if (e.target === dataModal) {
    dataModal.style.display = "none";
  }
});

// 上传到数据库
uploadBtn.addEventListener("click", async () => {
  if (localKOLs.length === 0) {
    alert("没有待上传的数据");
    return;
  }

  // 验证必填字段
  const incomplete = localKOLs.filter(
    (kol) => !kol.qualityScore || !kol.contentCategory
  );
  if (incomplete.length > 0) {
    alert(
      `有 ${incomplete.length} 个 KOL 未填写完整信息（质量评分和内容分类为必填项）\n请点击"查看数据"完成填写`
    );
    return;
  }

  if (!confirm(`确定上传 ${localKOLs.length} 个 KOL 到数据库？`)) {
    return;
  }

  uploadBtn.textContent = "⏳ 上传中...";
  uploadBtn.disabled = true;

  try {
    // 发送到 background 进行上传
    chrome.runtime.sendMessage(
      { action: "uploadKOLs", kols: localKOLs },
      (response) => {
        uploadBtn.textContent = "上传到数据库";
        uploadBtn.disabled = false;

        if (response && response.success) {
          alert(`✅ 成功上传 ${response.successCount} 个 KOL`);

          // 清空本地数据
          localKOLs = [];
          collectedCount = 0;
          chrome.storage.local.set({ pendingKOLs: [] }, () => {
            updateUI();
            statusText.textContent = "上传成功";
            statusEl.classList.add("active");
          });
        } else {
          alert(`上传失败: ${response?.message || "未知错误"}`);
        }
      }
    );
  } catch (error) {
    uploadBtn.textContent = "上传到数据库";
    uploadBtn.disabled = false;
    alert("上传失败: " + error.message);
  }
});

// 清空本地数据
clearBtn.addEventListener("click", () => {
  if (confirm("确定清空本地数据？")) {
    chrome.storage.local.set({ pendingKOLs: [] }, () => {
      localKOLs = [];
      collectedCount = 0;
      updateUI();
      statusEl.classList.remove("active");
      statusEl.classList.remove("error");
      statusText.textContent = "无数据";
    });
  }
});

// 更新 UI
function updateUI() {
  countEl.textContent = collectedCount;

  // 更新按钮状态
  if (collectedCount > 0) {
    viewBtn.disabled = false;
    uploadBtn.disabled = !extensionToken; // 只有配置了 Token 才能上传
    statusText.textContent = `有 ${collectedCount} 个待上传`;
  } else {
    viewBtn.disabled = true;
    uploadBtn.disabled = true;
    statusText.textContent = "无数据";
  }
}

// Token 配置按钮
configTokenBtn.addEventListener("click", () => {
  tokenModal.style.display = "flex";
  tokenModal.style.alignItems = "center";
  tokenModal.style.justifyContent = "center";
  tokenInput.value = extensionToken || "";
});

// 关闭 Token 弹窗
closeTokenModalBtn.addEventListener("click", () => {
  tokenModal.style.display = "none";
});

tokenModal.addEventListener("click", (e) => {
  if (e.target === tokenModal) {
    tokenModal.style.display = "none";
  }
});

// 保存 Token
saveTokenBtn.addEventListener("click", () => {
  const token = tokenInput.value.trim();

  if (!token) {
    alert("请输入 Token");
    return;
  }

  // 保存到 storage
  chrome.storage.local.set({ extensionToken: token }, () => {
    extensionToken = token;
    updateTokenUI(true);
    tokenModal.style.display = "none";
    alert("Token 配置成功");
    updateUI(); // 更新上传按钮状态
  });
});
