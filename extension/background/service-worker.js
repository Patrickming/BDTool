/**
 * Background Service Worker
 * 后台服务脚本，处理插件的后台逻辑
 */

console.log('[KOL BD Tool] Service Worker initialized');

// 监听插件安装
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('[KOL BD Tool] Extension installed');

    // 初始化存储
    chrome.storage.local.set({
      capturedToday: 0,
      installedAt: new Date().toISOString()
    });
  } else if (details.reason === 'update') {
    console.log('[KOL BD Tool] Extension updated');
  }
});

// 每天重置捕获计数
chrome.alarms.create('resetDailyCount', {
  periodInMinutes: 24 * 60 // 24 小时
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'resetDailyCount') {
    chrome.storage.local.set({ capturedToday: 0 });
    console.log('[KOL BD Tool] Daily count reset');
  }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAuth') {
    checkAuthStatus().then(sendResponse);
    return true;
  }

  if (request.action === 'saveKOL') {
    saveKOL(request.data).then(sendResponse);
    return true;
  }
});

/**
 * 检查认证状态
 */
async function checkAuthStatus() {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');

    if (!authToken) {
      return { authenticated: false };
    }

    const { apiUrl } = await chrome.storage.local.get('apiUrl');
    const baseUrl = apiUrl || 'http://localhost:3000/api/v1';

    const response = await fetch(`${baseUrl}/kols?limit=1`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });

    return {
      authenticated: response.ok
    };
  } catch (error) {
    return { authenticated: false, error: error.message };
  }
}

/**
 * 保存 KOL
 */
async function saveKOL(kolData) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');
    const { apiUrl } = await chrome.storage.local.get('apiUrl');
    const baseUrl = apiUrl || 'http://localhost:3000/api/v1';

    const response = await fetch(`${baseUrl}/kols`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(kolData)
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
