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
      // 显示模板区域
      showTemplateSection();
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
                min="0"
                max="100"
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
              <option value="zh" ${
                kol.language === "zh" ? "selected" : ""
              }>🇨🇳 中文</option>
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
              <option value="ar" ${
                kol.language === "ar" ? "selected" : ""
              }>🇸🇦 阿拉伯语</option>
              <option value="vi" ${
                kol.language === "vi" ? "selected" : ""
              }>🇻🇳 越南语</option>
              <option value="th" ${
                kol.language === "th" ? "selected" : ""
              }>🇹🇭 泰语</option>
              <option value="id" ${
                kol.language === "id" ? "selected" : ""
              }>🇮🇩 印尼语</option>
              <option value="tr" ${
                kol.language === "tr" ? "selected" : ""
              }>🇹🇷 土耳其语</option>
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

// ==================== 模板复制功能 ====================

const templateSection = document.getElementById('templateSection');
const templateSelect = document.getElementById('templateSelect');
const templateSearchInput = document.getElementById('templateSearchInput');
const templateDropdown = document.getElementById('templateDropdown');
const kolSelect = document.getElementById('kolSelect');
const kolSearchInput = document.getElementById('kolSearchInput');
const kolDropdown = document.getElementById('kolDropdown');
const languageSelect = document.getElementById('languageSelect');
const enableAI = document.getElementById('enableAI');
const aiToneSection = document.getElementById('aiToneSection');
const aiToneSelect = document.getElementById('aiToneSelect');
const copyTemplateBtn = document.getElementById('copyTemplateBtn');
const templateStatus = document.getElementById('templateStatus');

let allTemplates = [];
let allKols = [];
let currentTemplateContent = '';
let selectedTemplate = null;
let selectedKol = null;
let currentTemplateDetail = null; // 存储当前选中模板的详细信息

/**
 * 显示模板区域
 */
function showTemplateSection() {
  if (!extensionToken) {
    return; // 没有 token 就不显示
  }

  templateSection.style.display = 'block';

  // 加载模板列表
  if (allTemplates.length === 0) {
    loadTemplates();
  }

  // 加载 KOL 列表
  if (allKols.length === 0) {
    loadKols();
  }
}

/**
 * 隐藏模板区域
 */
function hideTemplateSection() {
  templateSection.style.display = 'none';
}

/**
 * 加载模板列表
 */
async function loadTemplates() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getTemplates'
    });

    if (response && response.success) {
      allTemplates = response.data.templates || [];
      console.log('加载了', allTemplates.length, '个模板');
    } else {
      throw new Error(response?.error || '加载模板失败');
    }
  } catch (error) {
    console.error('加载模板失败:', error);
    showTemplateStatus('加载模板失败: ' + error.message, 'error');
  }
}

/**
 * 加载 KOL 列表
 */
async function loadKols() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getKols'
    });

    if (response && response.success) {
      allKols = response.data.kols || [];
      console.log('加载了', allKols.length, '个 KOL');
    }
  } catch (error) {
    console.error('加载 KOL 失败:', error);
  }
}

/**
 * 渲染模板下拉列表
 */
function renderTemplateDropdown(searchTerm = '') {
  const filtered = searchTerm
    ? allTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allTemplates;

  if (filtered.length === 0) {
    templateDropdown.innerHTML = '<div style="padding: 8px; color: #999; font-size: 11px;">没有找到匹配的模板</div>';
  } else {
    templateDropdown.innerHTML = filtered.slice(0, 50).map(template => `
      <div
        class="template-option"
        data-id="${template.id}"
        data-name="${template.name}"
        style="padding: 8px; cursor: pointer; font-size: 12px; border-bottom: 1px solid #333;"
        onmouseover="this.style.background='#2a2a2a'"
        onmouseout="this.style.background='transparent'"
      >
        ${template.name}
      </div>
    `).join('');
  }

  templateDropdown.style.display = 'block';

  // 添加点击事件
  document.querySelectorAll('.template-option').forEach(option => {
    option.addEventListener('click', async () => {
      const templateId = option.dataset.id;
      const templateName = option.dataset.name;

      selectedTemplate = allTemplates.find(t => t.id === parseInt(templateId));
      templateSelect.value = templateId;
      templateSearchInput.value = templateName;
      templateDropdown.style.display = 'none';

      // 加载模板详情
      await loadTemplateDetail(parseInt(templateId));

      // 触发模板加载
      loadTemplatePreview();
    });
  });
}

/**
 * 渲染 KOL 下拉列表
 */
function renderKolDropdown(searchTerm = '') {
  const filtered = searchTerm
    ? allKols.filter(kol =>
        kol.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allKols;

  if (filtered.length === 0) {
    kolDropdown.innerHTML = '<div style="padding: 8px; color: #999; font-size: 11px;">没有找到匹配的 KOL</div>';
  } else {
    kolDropdown.innerHTML = filtered.slice(0, 50).map(kol => `
      <div
        class="kol-option"
        data-id="${kol.id}"
        data-username="${kol.username}"
        style="padding: 8px; cursor: pointer; font-size: 12px; border-bottom: 1px solid #333;"
        onmouseover="this.style.background='#2a2a2a'"
        onmouseout="this.style.background='transparent'"
      >
        @${kol.username}
      </div>
    `).join('');
  }

  kolDropdown.style.display = 'block';

  // 添加点击事件
  document.querySelectorAll('.kol-option').forEach(option => {
    option.addEventListener('click', () => {
      const kolId = option.dataset.id;
      const username = option.dataset.username;

      selectedKol = allKols.find(k => k.id === parseInt(kolId));
      kolSelect.value = kolId;
      kolSearchInput.value = `@${username}`;
      kolDropdown.style.display = 'none';

      // 触发模板重新加载
      if (templateSelect.value) {
        loadTemplatePreview();
      }
    });
  });
}

/**
 * 模板搜索输入框事件
 */
templateSearchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value;
  if (searchTerm.length > 0) {
    renderTemplateDropdown(searchTerm);
  } else {
    selectedTemplate = null;
    templateSelect.value = '';
    currentTemplateContent = '';
    copyTemplateBtn.disabled = true;
    renderTemplateDropdown('');
  }
});

templateSearchInput.addEventListener('focus', () => {
  if (allTemplates.length > 0) {
    renderTemplateDropdown(templateSearchInput.value);
  }
});

/**
 * KOL 搜索输入框事件
 */
kolSearchInput.addEventListener('input', (e) => {
  const searchTerm = e.target.value.replace('@', '');
  if (searchTerm.length > 0) {
    renderKolDropdown(searchTerm);
  } else {
    selectedKol = null;
    kolSelect.value = '';
    renderKolDropdown('');

    // 如果已选择模板，重新加载（去掉 KOL 替换）
    if (templateSelect.value) {
      loadTemplatePreview();
    }
  }
});

kolSearchInput.addEventListener('focus', () => {
  if (allKols.length > 0) {
    renderKolDropdown(kolSearchInput.value.replace('@', ''));
  }
});

/**
 * 语言选择变化事件 - 重新加载模板
 */
languageSelect.addEventListener('change', () => {
  // 如果已选择模板，重新加载预览
  if (templateSelect.value) {
    loadTemplatePreview();
  }
});

// 点击外部关闭下拉框
document.addEventListener('click', (e) => {
  if (!templateSearchInput.contains(e.target) && !templateDropdown.contains(e.target)) {
    templateDropdown.style.display = 'none';
  }
  if (!kolSearchInput.contains(e.target) && !kolDropdown.contains(e.target)) {
    kolDropdown.style.display = 'none';
  }
});

/**
 * AI 改写 checkbox 变化 - 显示/隐藏风格选择
 */
enableAI.addEventListener('change', (e) => {
  if (e.target.checked) {
    aiToneSection.style.display = 'block';
  } else {
    aiToneSection.style.display = 'none';
  }
});

/**
 * 加载模板详情
 */
async function loadTemplateDetail(templateId) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'getTemplateDetail',
      templateId: templateId
    });

    if (response && response.success) {
      currentTemplateDetail = response.data;

      // 更新语言选择器（只显示该模板支持的语言）
      updateLanguageOptions(currentTemplateDetail.versions);

      // 根据是否有占位符决定是否显示 KOL 选择器
      updateKolSectionVisibility(currentTemplateDetail.versions);
    } else {
      console.error('加载模板详情失败:', response?.error);
    }
  } catch (error) {
    console.error('加载模板详情异常:', error);
  }
}

/**
 * 更新语言选择器 - 只显示模板支持的语言
 */
function updateLanguageOptions(versions) {
  if (!versions || versions.length === 0) {
    return;
  }

  // 获取模板支持的所有语言
  const availableLanguages = versions.map(v => v.language);

  // 语言映射
  const languageMap = {
    'en': '🇺🇸 英语 (English)',
    'zh': '🇨🇳 中文 (Chinese)',
    'ja': '🇯🇵 日语 (Japanese)',
    'ko': '🇰🇷 韩语 (Korean)',
    'fr': '🇫🇷 法语 (French)',
    'de': '🇩🇪 德语 (German)',
    'ru': '🇷🇺 俄语 (Russian)',
    'es': '🇪🇸 西班牙语 (Spanish)',
    'pt': '🇵🇹 葡萄牙语 (Portuguese)'
  };

  // 清空并重新填充语言选择器
  languageSelect.innerHTML = '';

  availableLanguages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = languageMap[lang] || lang;
    languageSelect.appendChild(option);
  });

  // 如果只有一个语言，自动选中
  if (availableLanguages.length === 1) {
    languageSelect.value = availableLanguages[0];
  } else {
    // 优先选择英语，如果没有则选择第一个
    if (availableLanguages.includes('en')) {
      languageSelect.value = 'en';
    } else {
      languageSelect.value = availableLanguages[0];
    }
  }
}

/**
 * 更新 KOL 选择区域显示 - 根据模板是否有占位符
 */
function updateKolSectionVisibility(versions) {
  const kolSection = document.getElementById('kolSearchInput').parentElement;

  if (!versions || versions.length === 0) {
    kolSection.style.display = 'block'; // 默认显示
    return;
  }

  // 检查所有版本的内容是否包含变量占位符
  const hasVariables = versions.some(v => {
    const content = v.content || '';
    // 检查是否包含 {{xxx}} 格式的占位符
    return /\{\{[^}]+\}\}/.test(content);
  });

  // 如果没有占位符，隐藏 KOL 选择区域
  if (hasVariables) {
    kolSection.style.display = 'block';
  } else {
    kolSection.style.display = 'none';
    // 清空 KOL 选择
    kolSelect.value = '';
    kolSearchInput.value = '';
    selectedKol = null;
  }
}

/**
 * 加载模板预览
 */
async function loadTemplatePreview() {
  const templateId = templateSelect.value;

  if (!templateId) {
    copyTemplateBtn.disabled = true;
    currentTemplateContent = '';
    return;
  }

  try {
    copyTemplateBtn.disabled = true;
    showTemplateStatus('加载中...', 'loading');

    // 获取选中的 KOL 和语言
    const kolId = kolSelect.value ? parseInt(kolSelect.value) : null;
    const language = languageSelect.value || 'en';

    const response = await chrome.runtime.sendMessage({
      action: 'previewTemplate',
      templateId: parseInt(templateId),
      kolId: kolId,
      language: language
    });

    if (response && response.success) {
      currentTemplateContent = response.data.previewContent || '';
      copyTemplateBtn.disabled = false;
      hideTemplateStatus();
    } else {
      throw new Error(response?.error || '预览模板失败');
    }
  } catch (error) {
    console.error('预览模板失败:', error);
    showTemplateStatus('预览失败: ' + error.message, 'error');
  }
}

/**
 * 复制模板内容
 */
copyTemplateBtn.addEventListener('click', async () => {
  if (!currentTemplateContent) {
    showTemplateStatus('没有可复制的内容', 'error');
    return;
  }

  try {
    let contentToCopy = currentTemplateContent;

    // 如果启用了 AI 改写
    if (enableAI.checked) {
      copyTemplateBtn.disabled = true;
      copyTemplateBtn.textContent = '⏳ AI 改写中...';

      // 获取选择的改写风格和语言
      const selectedTone = aiToneSelect.value || 'professional';
      const selectedLanguage = languageSelect.value || 'en';

      const response = await chrome.runtime.sendMessage({
        action: 'rewriteText',
        text: currentTemplateContent,
        tone: selectedTone,
        language: selectedLanguage
      });

      copyTemplateBtn.textContent = '📋 复制模板内容';
      copyTemplateBtn.disabled = false;

      if (response && response.success) {
        contentToCopy = response.data.rewritten || currentTemplateContent;
        showTemplateStatus('✅ AI 改写成功，正在复制...', 'success');
      } else {
        throw new Error(response?.error || 'AI 改写失败');
      }
    }

    // 复制到剪贴板 - 使用 textarea 方法确保兼容性
    const textarea = document.createElement('textarea');
    textarea.value = contentToCopy;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        throw new Error('复制命令执行失败');
      }
    } finally {
      document.body.removeChild(textarea);
    }

    if (enableAI.checked) {
      showTemplateStatus('✅ 已复制 AI 改写后的内容', 'success');
    } else {
      showTemplateStatus('✅ 已复制到剪贴板', 'success');
    }

    setTimeout(() => hideTemplateStatus(), 2000);
  } catch (error) {
    console.error('复制失败:', error);
    showTemplateStatus('❌ ' + error.message, 'error');
    copyTemplateBtn.textContent = '📋 复制模板内容';
    copyTemplateBtn.disabled = false;
  }
});

/**
 * 显示状态提示
 */
function showTemplateStatus(message, type) {
  templateStatus.textContent = message;
  templateStatus.style.display = 'block';

  if (type === 'success') {
    templateStatus.style.background = '#1a3a1a';
    templateStatus.style.color = '#51cf66';
  } else if (type === 'error') {
    templateStatus.style.background = '#3a1a1a';
    templateStatus.style.color = '#ff6b6b';
  } else {
    templateStatus.style.background = '#2a2a2a';
    templateStatus.style.color = '#999';
  }
}

/**
 * 隐藏状态提示
 */
function hideTemplateStatus() {
  templateStatus.style.display = 'none';
}
