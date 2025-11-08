/**
 * Content Script - 主入口
 * 注入到 Twitter 页面，负责UI注入和消息通信
 */

console.log('[KOL BD Tool] Extension loaded');

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractUserProfile') {
    handleExtractUserProfile(sendResponse);
    return true; // 保持消息通道打开
  }

  if (request.action === 'batchExtractUsers') {
    handleBatchExtractUsers(sendResponse);
    return true;
  }
});

/**
 * 处理提取当前用户资料
 */
async function handleExtractUserProfile(sendResponse) {
  try {
    // 提取用户资料
    const profile = TwitterScraper.extractUserProfile();

    if (!profile || !profile.username) {
      sendResponse({
        success: false,
        error: '无法提取用户资料，请确保当前页面为 Twitter 个人主页'
      });
      return;
    }

    // 保存到后端
    const result = await saveKOLToBackend(profile);

    if (result.success) {
      sendResponse({
        success: true,
        data: profile
      });

      // 更新今日捕获计数
      incrementTodayCaptured();
    } else {
      sendResponse({
        success: false,
        error: result.error || '保存失败'
      });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * 处理批量提取用户
 */
async function handleBatchExtractUsers(sendResponse) {
  try {
    // 批量提取用户列表
    const users = TwitterScraper.extractVisibleUsers();

    if (users.length === 0) {
      sendResponse({
        success: false,
        error: '未找到可提取的用户'
      });
      return;
    }

    // 提取用户名列表
    const usernames = users.map(u => u.username);

    // 批量导入到后端
    const result = await batchImportToBackend(usernames);

    if (result.success) {
      sendResponse({
        success: true,
        count: result.data.success
      });

      // 更新今日捕获计数
      await chrome.storage.local.set({
        capturedToday: (await getCapturedToday()) + result.data.success
      });
    } else {
      sendResponse({
        success: false,
        error: result.error || '批量导入失败'
      });
    }
  } catch (error) {
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

/**
 * 保存 KOL 到后端
 */
async function saveKOLToBackend(profile) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');

    if (!authToken) {
      return { success: false, error: '未登录，请先在插件中设置 Token' };
    }

    const response = await fetch('http://localhost:3000/api/v1/kols', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        username: profile.username,
        displayName: profile.displayName || profile.username,
        bio: profile.bio,
        followerCount: profile.followerCount || 0,
        followingCount: profile.followingCount || 0,
        verified: profile.verified || false,
        profileImgUrl: profile.profileImgUrl,
        status: 'new',
        contentCategory: 'unknown'
      })
    });

    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, error: error.message || '保存失败' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 批量导入到后端
 */
async function batchImportToBackend(usernames) {
  try {
    const { authToken } = await chrome.storage.local.get('authToken');

    if (!authToken) {
      return { success: false, error: '未登录' };
    }

    const response = await fetch('http://localhost:3000/api/v1/kols/batch/import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        inputs: usernames
      })
    });

    if (response.ok) {
      const result = await response.json();
      return { success: true, data: result.data };
    } else {
      const error = await response.json();
      return { success: false, error: error.message };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * 增加今日捕获计数
 */
async function incrementTodayCaptured() {
  const count = await getCapturedToday();
  await chrome.storage.local.set({ capturedToday: count + 1 });
}

/**
 * 获取今日捕获计数
 */
async function getCapturedToday() {
  const { capturedToday } = await chrome.storage.local.get('capturedToday');
  return capturedToday || 0;
}

/**
 * 在页面上注入"添加到系统"按钮
 */
function injectCaptureButton() {
  // 检查是否为个人主页
  if (!TwitterScraper.isProfilePage()) {
    return;
  }

  // 检查按钮是否已存在
  if (document.getElementById('kol-bd-capture-btn')) {
    return;
  }

  // 查找用户操作栏（关注按钮所在区域）
  const actionBar = document.querySelector('[data-testid="userActions"]');
  if (!actionBar) {
    return;
  }

  // 创建按钮
  const button = document.createElement('button');
  button.id = 'kol-bd-capture-btn';
  button.className = 'kol-bd-tool-button';
  button.innerHTML = '📸 添加到系统';
  button.title = '将此用户添加到 KOL BD Tool';

  // 绑定点击事件
  button.addEventListener('click', async () => {
    button.disabled = true;
    button.textContent = '处理中...';

    try {
      const profile = TwitterScraper.extractUserProfile();
      const result = await saveKOLToBackend(profile);

      if (result.success) {
        button.textContent = '✅ 已添加';
        button.style.background = '#10b981';
        setTimeout(() => {
          button.textContent = '📸 添加到系统';
          button.style.background = '';
          button.disabled = false;
        }, 2000);
      } else {
        button.textContent = '❌ 失败';
        button.style.background = '#ef4444';
        alert(result.error || '添加失败');
        setTimeout(() => {
          button.textContent = '📸 添加到系统';
          button.style.background = '';
          button.disabled = false;
        }, 2000);
      }
    } catch (error) {
      button.textContent = '❌ 错误';
      button.style.background = '#ef4444';
      alert('添加失败: ' + error.message);
      setTimeout(() => {
        button.textContent = '📸 添加到系统';
        button.style.background = '';
        button.disabled = false;
      }, 2000);
    }
  });

  // 插入按钮
  actionBar.appendChild(button);
}

// 监听页面变化，动态注入按钮
const observer = new MutationObserver(() => {
  injectCaptureButton();
});

// 开始观察
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 初始化时尝试注入
setTimeout(() => {
  injectCaptureButton();
}, 2000);
