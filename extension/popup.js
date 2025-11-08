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

// 弹窗元素
const dataModal = document.getElementById("dataModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const kolListContainer = document.getElementById("kolListContainer");
const saveEditsBtn = document.getElementById("saveEditsBtn");

// 状态管理
let collectedCount = 0;
let localKOLs = []; // 本地待上传的 KOL 数据

// 初始化：恢复状态 + 检测页面
async function initialize() {
  // 恢复本地数据
  chrome.storage.local.get(["pendingKOLs"], (result) => {
    if (result.pendingKOLs && result.pendingKOLs.length > 0) {
      localKOLs = result.pendingKOLs;
      collectedCount = localKOLs.length;
      updateUI();
    }
  });

  // 检测当前页面
  await detectCurrentPage();
}

// 执行初始化
initialize();

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

    if (tab.url.includes("twitter.com") || tab.url.includes("x.com")) {
      // 检测是否为个人主页 (例如: x.com/VitalikButerin)
      const match = tab.url.match(/\/([\w]+)$/);
      if (match && !["home", "explore", "notifications", "messages"].includes(match[1])) {
        pageType.textContent = `✅ Twitter 主页 (@${match[1]})`;
        pageDetectionEl.classList.add("active");
        extractBtn.disabled = false;
      } else {
        pageType.textContent = "📍 非 KOL 主页";
        pageDetectionEl.classList.remove("active");
        extractBtn.disabled = true;
      }
    } else {
      pageType.textContent = "❌ 非 Twitter 页面";
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
              qualityScore: null, // 质量评分
              category: null, // 内容分类
              tags: [], // 标签
              status: "新添加", // 状态
              capturedAt: new Date().toISOString(),
            };

            // 检查是否已存在
            const exists = localKOLs.some(k => k.username === kolData.username);
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
          ${kol.profileImgUrl ? `<img src="${kol.profileImgUrl}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;">` : ''}
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
                value="${kol.qualityScore || ''}"
                placeholder="1-5"
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
                <option value="技术开发" ${kol.category === '技术开发' ? 'selected' : ''}>技术开发</option>
                <option value="项目方" ${kol.category === '项目方' ? 'selected' : ''}>项目方</option>
                <option value="投资机构" ${kol.category === '投资机构' ? 'selected' : ''}>投资机构</option>
                <option value="意见领袖" ${kol.category === '意见领袖' ? 'selected' : ''}>意见领袖</option>
                <option value="媒体资讯" ${kol.category === '媒体资讯' ? 'selected' : ''}>媒体资讯</option>
                <option value="其他" ${kol.category === '其他' ? 'selected' : ''}>其他</option>
              </select>
            </div>
          </div>

          <div>
            <label style="color: #999; font-size: 12px; display: block; margin-bottom: 4px;">
              标签（逗号分隔）
            </label>
            <input
              type="text"
              id="tags_${index}"
              value="${kol.tags?.join(',') || ''}"
              placeholder="例如: DeFi,以太坊,开发者"
              style="width: 100%; padding: 6px; background: #1e2329; border: 1px solid #444; border-radius: 4px; color: #fff;"
            />
          </div>

          <div style="margin-top: 8px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 12px; color: #999;">状态: ${kol.status}</span>
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
window.removeKOL = function(index) {
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
    const tagsInput = document.getElementById(`tags_${index}`);

    kol.qualityScore = qualityInput.value ? parseInt(qualityInput.value) : null;
    kol.category = categoryInput.value || null;
    kol.tags = tagsInput.value ? tagsInput.value.split(',').map(t => t.trim()).filter(t => t) : [];
  });

  // 保存到 storage
  chrome.storage.local.set({ pendingKOLs: localKOLs }, () => {
    alert("修改已保存");
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
  const incomplete = localKOLs.filter(kol => !kol.qualityScore || !kol.category);
  if (incomplete.length > 0) {
    alert(`有 ${incomplete.length} 个 KOL 未填写完整信息（质量评分和内容分类为必填项）\n请点击"查看数据"完成填写`);
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
          alert(`上传失败: ${response?.message || '未知错误'}`);
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
    uploadBtn.disabled = false;
    statusText.textContent = `有 ${collectedCount} 个待上传`;
  } else {
    viewBtn.disabled = true;
    uploadBtn.disabled = true;
    statusText.textContent = "无数据";
  }
}
