/**
 * Popup 页面逻辑
 */

// DOM 元素
let unauthenticated, authenticated, loading;
let tokenInput, saveTokenBtn, logoutBtn;
let captureCurrentBtn, batchCaptureBtn;
let pageType, todayCaptured, totalKOLs;

// 初始化
document.addEventListener('DOMContentLoaded', async () => {
  // 获取 DOM 元素
  unauthenticated = document.getElementById('unauthenticated');
  authenticated = document.getElementById('authenticated');
  loading = document.getElementById('loading');
  tokenInput = document.getElementById('tokenInput');
  saveTokenBtn = document.getElementById('saveTokenBtn');
  logoutBtn = document.getElementById('logoutBtn');
  captureCurrentBtn = document.getElementById('captureCurrentBtn');
  batchCaptureBtn = document.getElementById('batchCaptureBtn');
  pageType = document.getElementById('pageType');
  todayCaptured = document.getElementById('todayCaptured');
  totalKOLs = document.getElementById('totalKOLs');

  // 绑定事件
  saveTokenBtn.addEventListener('click', saveToken);
  logoutBtn.addEventListener('click', logout);
  captureCurrentBtn.addEventListener('click', captureCurrent);
  batchCaptureBtn.addEventListener('click', batchCapture);

  // 检查认证状态
  await checkAuthStatus();
});

/**
 * 检查认证状态
 */
async function checkAuthStatus() {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');

    if (!authToken) {
      showUnauthenticated();
      return;
    }

    // 测试 Token 有效性
    const response = await fetch('http://localhost:3000/api/v1/kols?limit=1', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    if (response.ok) {
      showAuthenticated();
      await detectCurrentPage();
      await loadStats();
    } else {
      showUnauthenticated();
      showMessage('Token 已过期，请重新登录', 'error');
    }
  } catch (error) {
    showUnauthenticated();
    showMessage('无法连接到服务器', 'error');
  }
}

/**
 * 显示未认证状态
 */
function showUnauthenticated() {
  unauthenticated.style.display = 'block';
  authenticated.style.display = 'none';
  loading.style.display = 'none';
}

/**
 * 显示已认证状态
 */
function showAuthenticated() {
  unauthenticated.style.display = 'none';
  authenticated.style.display = 'block';
  loading.style.display = 'none';
}

/**
 * 保存 Token
 */
async function saveToken() {
  const token = tokenInput.value.trim();

  if (!token) {
    showMessage('请输入 Token', 'error');
    return;
  }

  // 测试 Token
  try {
    const response = await fetch('http://localhost:3000/api/v1/kols?limit=1', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      await chrome.storage.local.set({ authToken: token });
      showMessage('Token 保存成功', 'success');
      setTimeout(() => checkAuthStatus(), 1000);
    } else {
      showMessage('Token 无效', 'error');
    }
  } catch (error) {
    showMessage('无法连接到服务器', 'error');
  }
}

/**
 * 退出登录
 */
async function logout() {
  await chrome.storage.local.clear();
  showMessage('已退出登录', 'success');
  setTimeout(() => checkAuthStatus(), 1000);
}

/**
 * 检测当前页面类型
 */
async function detectCurrentPage() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url) {
      pageType.textContent = '❌ 无法访问此页面';
      return;
    }

    if (tab.url.includes('twitter.com') || tab.url.includes('x.com')) {
      // 检测是否为个人主页
      if (tab.url.match(/\/([\w]+)$/)) {
        pageType.textContent = '✅ Twitter 个人主页';
        captureCurrentBtn.disabled = false;
        batchCaptureBtn.disabled = true;
      }
      // 检测是否为关注列表
      else if (tab.url.includes('/following') || tab.url.includes('/followers')) {
        pageType.textContent = '✅ 关注/粉丝列表';
        captureCurrentBtn.disabled = true;
        batchCaptureBtn.disabled = false;
      } else {
        pageType.textContent = '📍 Twitter 页面';
        captureCurrentBtn.disabled = true;
        batchCaptureBtn.disabled = true;
      }
    } else {
      pageType.textContent = '❌ 非 Twitter 页面';
      captureCurrentBtn.disabled = true;
      batchCaptureBtn.disabled = true;
    }
  } catch (error) {
    pageType.textContent = '❌ 检测失败';
  }
}

/**
 * 加载统计信息
 */
async function loadStats() {
  // TODO: 从后端获取统计数据
  const { capturedToday } = await chrome.storage.local.get('capturedToday');
  todayCaptured.textContent = capturedToday || 0;
  totalKOLs.textContent = '-';
}

/**
 * 捕获当前用户
 */
async function captureCurrent() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 向 content script 发送消息
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'extractUserProfile'
    });

    if (response.success) {
      showMessage(`成功捕获: @${response.data.username}`, 'success');
      await loadStats();
    } else {
      showMessage(response.error || '捕获失败', 'error');
    }
  } catch (error) {
    showMessage('捕获失败: ' + error.message, 'error');
  }
}

/**
 * 批量捕获
 */
async function batchCapture() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 向 content script 发送消息
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'batchExtractUsers'
    });

    if (response.success) {
      showMessage(`成功捕获 ${response.count} 个用户`, 'success');
      await loadStats();
    } else {
      showMessage(response.error || '批量捕获失败', 'error');
    }
  } catch (error) {
    showMessage('批量捕获失败: ' + error.message, 'error');
  }
}

/**
 * 显示消息
 */
function showMessage(text, type = 'success') {
  const message = document.getElementById('message');
  message.textContent = text;
  message.className = `message ${type}`;
  message.style.display = 'block';

  setTimeout(() => {
    message.style.display = 'none';
  }, 3000);
}
