// UI 元素
const extractBtn = document.getElementById("extractBtn");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const exportExcelBtn = document.getElementById("exportExcelBtn");
const clearBtn = document.getElementById("clearBtn");
const statusEl = document.getElementById("status");
const statusText = document.getElementById("statusText");
const countEl = document.getElementById("count");

// 统计UI元素
const statsButtonsArea = document.getElementById("statsButtonsArea");
const viewStatsBtn = document.getElementById("viewStatsBtn");
const exportStatsBtn = document.getElementById("exportStatsBtn");
const statsModal = document.getElementById("statsModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const wearDetailsEl = document.getElementById("wearDetails");
const dailyPointsDetailsEl = document.getElementById("dailyPointsDetails");

// 倍数输入弹窗UI元素
const multiplierModal = document.getElementById("multiplierModal");
const closeMultiplierModalBtn = document.getElementById(
  "closeMultiplierModalBtn"
);
const cancelMultiplierBtn = document.getElementById("cancelMultiplierBtn");
const saveMultiplierBtn = document.getElementById("saveMultiplierBtn");
const multiplierInputList = document.getElementById("multiplierInputList");

// 状态管理
let collectedCount = 0;
let statsData = null; // 缓存统计数据
let multiplierManager = null; // 倍数管理器
let unknownCoins = []; // 未知倍数的币种列表

// ==================== 统计计算函数 ====================

// 获取北京时间
function getBeijingTime() {
  const now = new Date();
  // 将本地时间转换为UTC，然后加8小时得到北京时间
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utcTime + 3600000 * 8); // UTC+8
}

// 格式化日期为 YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 格式化时间为 YYYY-MM-DD HH:MM:SS
function formatDateTime(date) {
  const dateStr = formatDate(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${dateStr} ${hours}:${minutes}:${seconds}`;
}

// 获取订单的有效交易日（按14:00分界）
function getEffectiveDate(orderTimeStr) {
  // "2025-10-21 15:23:08" -> Date对象
  const parts = orderTimeStr.split(" ");
  const dateParts = parts[0].split("-");
  const timeParts = parts[1].split(":");

  const orderTime = new Date(
    parseInt(dateParts[0]),
    parseInt(dateParts[1]) - 1,
    parseInt(dateParts[2]),
    parseInt(timeParts[0]),
    parseInt(timeParts[1]),
    parseInt(timeParts[2])
  );

  // 如果时间 < 14:00，算作前一天
  if (orderTime.getHours() < 14) {
    orderTime.setDate(orderTime.getDate() - 1);
  }

  return formatDate(orderTime);
}

// 获取当前北京时间的15天有效窗口
function getValid15DayWindow() {
  const bjNow = getBeijingTime();

  // 计算有效结束日期
  // 如果当前时间 >= 14:00，有效期到昨天
  // 如果当前时间 < 14:00，有效期到前天
  let effectiveEndDate = new Date(bjNow);
  effectiveEndDate.setDate(effectiveEndDate.getDate() - 1); // 先减去1天（昨天）

  if (bjNow.getHours() < 14) {
    effectiveEndDate.setDate(effectiveEndDate.getDate() - 1); // 再减去1天（前天）
  }

  // 计算有效开始日期（结束日期往前推14天，总共15天）
  const effectiveStartDate = new Date(effectiveEndDate);
  effectiveStartDate.setDate(effectiveStartDate.getDate() - 14);

  return {
    startDate: formatDate(effectiveStartDate),
    endDate: formatDate(effectiveEndDate),
    currentBjTime: formatDateTime(bjNow),
  };
}

// 计算积分（严格大于）
function calculatePoints(amount) {
  if (amount > 128) return 7;
  if (amount > 64) return 6;
  if (amount > 32) return 5;
  if (amount > 16) return 4;
  if (amount > 8) return 3;
  if (amount > 4) return 2;
  if (amount > 2) return 1;
  return 0;
}

// 解析金额（从字符串提取数字）
function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const match = String(amountStr).match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

// 计算统计数据（支持倍数加权）
function calculateStats(orders) {
  if (!orders || orders.length === 0) {
    return null;
  }

  // 获取当前有效窗口
  const window = getValid15DayWindow();

  let totalBuy = 0;
  let totalSell = 0;
  const dailyBuyDetails = {}; // 按日期按币种详细记录

  // 记录所有未知倍数的币种
  const unknownCoinsSet = new Set();

  // 遍历所有订单
  orders.forEach((order) => {
    // 只统计已成交订单
    if (order.状态 !== "已成交") return;

    const amount = parseAmount(order.成交额);
    const coin = order.代币;
    const effectiveDate = getEffectiveDate(order.创建时间);

    // 调试日志：输出每笔交易的分类情况
    console.log(
      `[订单分类] 创建时间: ${order.创建时间} | 方向: ${
        order.方向
      } | 代币: ${coin} | 金额: ${amount.toFixed(
        2
      )} | 有效日期: ${effectiveDate}`
    );

    // 统计买入卖出
    if (order.方向 === "买入") {
      totalBuy += amount;

      // 初始化日期数据
      if (!dailyBuyDetails[effectiveDate]) {
        dailyBuyDetails[effectiveDate] = {
          coins: {},
          originalTotal: 0,
          weightedTotal: 0,
          hasUnknownMultiplier: false,
        };
      }

      // 初始化币种数据
      if (!dailyBuyDetails[effectiveDate].coins[coin]) {
        // 获取倍数
        const multiplier = multiplierManager
          ? multiplierManager.getMultiplier(coin)
          : null;

        if (multiplier === null) {
          unknownCoinsSet.add(coin);
          dailyBuyDetails[effectiveDate].hasUnknownMultiplier = true;
        }

        dailyBuyDetails[effectiveDate].coins[coin] = {
          amount: 0,
          multiplier: multiplier,
          weightedAmount: 0,
        };
      }

      // 累加金额
      const coinData = dailyBuyDetails[effectiveDate].coins[coin];
      coinData.amount += amount;
      dailyBuyDetails[effectiveDate].originalTotal += amount;

      // 如果有倍数，计算加权金额
      if (coinData.multiplier !== null) {
        const weighted = amount * coinData.multiplier;
        coinData.weightedAmount += weighted;
        dailyBuyDetails[effectiveDate].weightedTotal += weighted;
      }
    } else if (order.方向 === "卖出") {
      totalSell += amount;
    }
  });

  // 调试日志：输出每日汇总
  console.log("=== 每日汇总（dailyBuyDetails）===");
  Object.keys(dailyBuyDetails)
    .sort()
    .forEach((date) => {
      const details = dailyBuyDetails[date];
      console.log(
        `${date}: 原始=${details.originalTotal.toFixed(
          2
        )} USDT, 加权=${details.weightedTotal.toFixed(2)} USDT`
      );
    });

  // 更新全局未知币种列表
  unknownCoins = Array.from(unknownCoinsSet);

  // 计算盈亏（卖出收入 - 买入成本）
  const wear = totalSell - totalBuy;

  // 计算每日积分（使用加权金额），并标注是否在有效窗口内
  const dailyPoints = {};
  let totalPoints = 0;
  let totalWeightedBuy = 0;
  let validWindowPoints = 0;
  let validWindowWeightedBuy = 0;
  let validWindowDays = 0;

  for (const [date, details] of Object.entries(dailyBuyDetails)) {
    const isValid = date >= window.startDate && date <= window.endDate;

    // 如果有未知倍数，无法计算准确积分
    let points = null;
    if (!details.hasUnknownMultiplier) {
      points = calculatePoints(details.weightedTotal);
      totalPoints += points;
      totalWeightedBuy += details.weightedTotal;

      if (isValid) {
        validWindowPoints += points;
        validWindowWeightedBuy += details.weightedTotal;
        validWindowDays++;
      }
    }

    dailyPoints[date] = {
      originalAmount: details.originalTotal,
      weightedAmount: details.hasUnknownMultiplier
        ? null
        : details.weightedTotal,
      points: points,
      coins: details.coins,
      hasUnknownMultiplier: details.hasUnknownMultiplier,
      isValid: isValid,
    };
  }

  // 调试日志：输出 dailyPoints 结构
  console.log("=== dailyPoints 对象 ===");
  Object.keys(dailyPoints)
    .sort()
    .forEach((date) => {
      const dp = dailyPoints[date];
      console.log(
        `${date}: originalAmount=${dp.originalAmount.toFixed(
          2
        )}, weightedAmount=${
          dp.weightedAmount ? dp.weightedAmount.toFixed(2) : "null"
        }, points=${dp.points}`
      );
    });

  // 交易天数
  const tradingDays = Object.keys(dailyBuyDetails).length;

  return {
    // 历史总计
    totalBuy, // 原始总买入
    totalWeightedBuy, // 加权总买入
    totalSell,
    wear,
    dailyPoints,
    totalPoints,
    tradingDays,

    // 有效窗口统计
    validWindowPoints,
    validWindowWeightedBuy,
    validWindowDays,

    // 窗口信息
    windowStartDate: window.startDate,
    windowEndDate: window.endDate,
    currentBjTime: window.currentBjTime,

    // 未知币种
    hasUnknownCoins: unknownCoins.length > 0,
    unknownCoins: unknownCoins,
  };
}

// 更新统计UI显示
function updateStatsUI() {
  chrome.runtime.sendMessage({ action: "getOrdersForExport" }, (response) => {
    if (response && response.orders && response.orders.length > 0) {
      statsData = calculateStats(response.orders);

      if (statsData) {
        // 显示统计按钮区域
        statsButtonsArea.style.display = "block";
      }
    } else {
      // 没有数据，隐藏统计按钮区域
      statsButtonsArea.style.display = "none";
    }
  });
}

// 显示详细统计
function showStatsDetails() {
  if (!statsData) return;

  // 总计明细（适配夜间模式）
  const wearColor = statsData.wear < 0 ? "#dc3545" : "#0ECB81";
  const wearSign = statsData.wear >= 0 ? "+" : "";
  const wearLabel = statsData.wear < 0 ? "亏损" : "盈利";

  // 是否有未知倍数的警告
  const unknownWarning = statsData.hasUnknownCoins
    ? `<div style="color: #ff6b6b; font-size: 12px; margin-top: 8px; padding: 8px; background: #3a1a1a; border-radius: 4px; border: 1px solid #ff6b6b;">
            ⚠️ 警告：检测到 ${
              statsData.unknownCoins.length
            } 个未知倍数币种（${statsData.unknownCoins.join(
        ", "
      )}），无法计算准确积分。
            <button id="fixMultiplierBtn" style="margin-left: 8px; padding: 4px 8px; background: #f0b90b; border: none; border-radius: 4px; cursor: pointer; color: #1e1e1e; font-weight: bold;">点击修复</button>
           </div>`
    : "";

  wearDetailsEl.innerHTML = `
        <div style="background: #2B3139; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <div style="color: #F0B90B; font-size: 13px; margin-bottom: 4px;">
                🕐 当前北京时间：${statsData.currentBjTime}
            </div>
            <div style="color: #0ECB81; font-size: 13px;">
                📅 有效积分窗口：${statsData.windowStartDate} ~ ${
    statsData.windowEndDate
  }（15天）
            </div>
        </div>
        ${unknownWarning}
        <div style="color: #E8E8E8;">• 总买入: ${statsData.totalBuy.toFixed(
          2
        )} USDT</div>
        <div style="color: #0ECB81;">• 有效买入（加权）: ${statsData.validWindowWeightedBuy.toFixed(
          2
        )} USDT</div>
        <div style="color: #E8E8E8;">• 总卖出: ${statsData.totalSell.toFixed(
          2
        )} USDT</div>
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px solid #555;">
            • 总计（${wearLabel}）: <strong style="color: ${wearColor}">${wearSign}${statsData.wear.toFixed(
    2
  )} USDT</strong>
        </div>
    `;

  // 每日积分明细（适配夜间模式 + 独立滚动 + 状态标注）
  const sortedDates = Object.keys(statsData.dailyPoints).sort().reverse(); // 降序

  // 外层容器带滚动
  let dailyHTML =
    '<div style="max-height: 400px; overflow-y: auto; margin: 8px 0; padding: 8px; background: #2B3139; border-radius: 4px;">';
  dailyHTML +=
    '<table style="width: 100%; border-collapse: collapse; font-size: 11px; color: #E8E8E8;">';
  dailyHTML +=
    '<thead style="position: sticky; top: 0; background: #2B3139; z-index: 1;"><tr style="background: #2B3139; font-weight: bold;">';
  dailyHTML += '<td style="padding: 6px; color: #F0B90B;">日期</td>';
  dailyHTML +=
    '<td style="text-align: right; padding: 6px; color: #F0B90B;">原始</td>';
  dailyHTML +=
    '<td style="text-align: right; padding: 6px; color: #F0B90B;">加权</td>';
  dailyHTML +=
    '<td style="text-align: right; padding: 6px; color: #F0B90B;">积分</td>';
  dailyHTML +=
    '<td style="text-align: center; padding: 6px; color: #F0B90B;">状态</td>';
  dailyHTML += "</tr></thead>";
  dailyHTML += "<tbody>";

  sortedDates.forEach((date) => {
    const data = statsData.dailyPoints[date];
    const rowColor = data.isValid ? "#E8E8E8" : "#999";
    const rowOpacity = data.isValid ? "1" : "0.6";
    const statusIcon = data.isValid ? "✅" : "❌";
    const statusText = data.isValid ? "有效" : "无效";
    const pointsColor = data.isValid ? "#0ECB81" : "#999";

    // 未知倍数标红
    const weightedDisplay = data.hasUnknownMultiplier
      ? '<span style="color: #ff6b6b; font-weight: bold;">⚠️未知</span>'
      : `${data.weightedAmount.toFixed(2)}`;

    const pointsDisplay = data.points !== null ? data.points : "?";

    dailyHTML += `
            <tr style="border-top: 1px solid #444; opacity: ${rowOpacity};">
                <td style="padding: 6px; color: ${rowColor};">${date}</td>
                <td style="text-align: right; padding: 6px; color: ${rowColor};">${data.originalAmount.toFixed(
      2
    )}</td>
                <td style="text-align: right; padding: 6px; color: ${
                  data.hasUnknownMultiplier ? "#ff6b6b" : rowColor
                };">${weightedDisplay}</td>
                <td style="text-align: right; padding: 6px; color: ${pointsColor}; font-weight: bold;">${pointsDisplay}</td>
                <td style="text-align: center; padding: 6px; color: ${rowColor}; font-size: 10px;">${statusIcon}${statusText}</td>
            </tr>
        `;
  });

  dailyHTML += "</tbody>";
  dailyHTML +=
    '<tfoot style="position: sticky; bottom: 0; background: #2B3139; z-index: 1;">';

  // 历史总计行
  dailyHTML += `
        <tr style="border-top: 2px solid #F0B90B; font-weight: bold; background: #2B3139;">
            <td style="padding: 6px; color: #999;">总计（全部）</td>
            <td style="text-align: right; padding: 6px; color: #999;">${statsData.totalBuy.toFixed(
              2
            )}</td>
            <td style="text-align: right; padding: 6px; color: #999;">${statsData.totalWeightedBuy.toFixed(
              2
            )}</td>
            <td style="text-align: right; padding: 6px; color: #999;">${
              statsData.totalPoints
            }</td>
            <td style="text-align: center; padding: 6px; color: #999; font-size: 10px;">-</td>
        </tr>
    `;

  // 有效窗口总计行（高亮）
  dailyHTML += `
        <tr style="font-weight: bold; background: #1a3a1a;">
            <td style="padding: 6px; color: #0ECB81;">有效窗口</td>
            <td style="text-align: right; padding: 6px; color: #0ECB81;">-</td>
            <td style="text-align: right; padding: 6px; color: #0ECB81;">${statsData.validWindowWeightedBuy.toFixed(
              2
            )}</td>
            <td style="text-align: right; padding: 6px; color: #0ECB81;">${
              statsData.validWindowPoints
            }</td>
            <td style="text-align: center; padding: 6px; color: #0ECB81; font-size: 10px;">✅</td>
        </tr>
    `;

  dailyHTML += "</tfoot>";
  dailyHTML += "</table>";
  dailyHTML += "</div>";

  dailyPointsDetailsEl.innerHTML = dailyHTML;

  // 显示弹窗
  statsModal.style.display = "flex";
  statsModal.style.alignItems = "center";
  statsModal.style.justifyContent = "center";

  // 绑定"点击修复"按钮事件
  const fixBtn = document.getElementById("fixMultiplierBtn");
  if (fixBtn) {
    fixBtn.addEventListener("click", showMultiplierInput);
  }
}

// 显示倍数输入弹窗
function showMultiplierInput() {
  if (unknownCoins.length === 0) {
    alert("没有未知倍数的币种");
    return;
  }

  // 生成输入列表
  let inputHTML = "";
  unknownCoins.forEach((coin) => {
    inputHTML += `
            <div style="margin-bottom: 12px; padding: 8px; background: #2b3139; border-radius: 4px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="color: #f0b90b; font-weight: bold;">${coin}</span>
                    <div>
                        <label style="color: #999; font-size: 12px; margin-right: 8px;">倍数:</label>
                        <select id="multiplier_${coin}" style="padding: 4px 8px; border-radius: 4px; background: #1e2329; color: #fff; border: 1px solid #444;">
                            <option value="1">1x</option>
                            <option value="2">2x</option>
                            <option value="4">4x</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
  });

  multiplierInputList.innerHTML = inputHTML;

  // 显示弹窗
  multiplierModal.style.display = "flex";
  multiplierModal.style.alignItems = "center";
  multiplierModal.style.justifyContent = "center";
}

// 初始化：恢复状态和倍数管理器
async function initialize() {
  // 初始化倍数管理器
  multiplierManager = new CoinMultiplierManager();
  await multiplierManager.initialize(true); // 自动更新

  // 恢复订单数据
  chrome.storage.local.get(["collectedOrders"], (result) => {
    if (result.collectedOrders && result.collectedOrders.length > 0) {
      collectedCount = result.collectedOrders.length;
      updateUI();
      exportCsvBtn.disabled = false;
      exportExcelBtn.disabled = false;
      updateStatsUI(); // 更新统计
    }
  });
}

// 执行初始化
initialize();

// 提取订单数据 - 从 DOM 提取
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

    if (!tab.url || !tab.url.includes("binance.com")) {
      alert("请在币安网站页面使用此插件！\n当前页面: " + (tab.url || "未知"));
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
        files: ["content-dom-extractor.js"],
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
        { action: "extractFromDOM" },
        (response) => {
          extractBtn.textContent = "提取订单数据";
          extractBtn.disabled = false;

          if (chrome.runtime.lastError) {
            statusText.textContent = "提取失败";
            statusEl.classList.remove("active");
            statusEl.classList.add("error");
            alert('提取失败：请在"历史委托"标签页重试');
          } else if (response && response.success) {
            statusText.textContent = "提取成功";
            statusEl.classList.remove("error");
            statusEl.classList.add("active");
            // 提取成功后更新统计
            setTimeout(() => updateStatsUI(), 500);
          } else {
            statusText.textContent = "未找到数据";
            statusEl.classList.remove("active");
            statusEl.classList.add("error");
            alert('未找到数据，请确保在"历史委托"标签页');
          }
        }
      );
    }, 500);
  } catch (error) {
    extractBtn.textContent = "提取订单数据";
    extractBtn.disabled = false;
    statusText.textContent = "发生错误";
    statusEl.classList.remove("active");
    statusEl.classList.add("error");
    alert("发生错误: " + error.message);
  }
});

// 导出 CSV
exportCsvBtn.addEventListener("click", async () => {
  chrome.runtime.sendMessage({ action: "getOrdersForExport" }, (response) => {
    if (response && response.orders && response.orders.length > 0) {
      downloadCSV(response.orders);
    } else {
      alert("没有数据可导出");
    }
  });
});

// 导出 Excel
exportExcelBtn.addEventListener("click", async () => {
  chrome.runtime.sendMessage({ action: "getOrdersForExport" }, (response) => {
    if (response && response.orders && response.orders.length > 0) {
      downloadExcel(response.orders);
    } else {
      alert("没有数据可导出");
    }
  });
});

// CSV 下载函数
function downloadCSV(orders) {
  const csv = generateCSV(orders);
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const filename = `binance_alpha_orders_${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  console.log(`✅ CSV 导出完成: ${orders.length} 条记录`);
}

// Excel 下载函数 - 使用真正的 XLSX 格式
function downloadExcel(orders) {
  // 固定列顺序
  const headers = [
    "创建时间",
    "代币",
    "类型",
    "方向",
    "平均价格",
    "价格",
    "已成交",
    "数量",
    "成交额",
    "反向订单",
    "状态",
  ];

  // 构建数据数组（第一行是表头）
  const data = [headers];

  // 添加数据行
  orders.forEach((order) => {
    const row = headers.map((header) => order[header] || "");
    data.push(row);
  });

  // 使用 SheetJS 创建工作簿
  const ws = XLSX.utils.aoa_to_sheet(data);

  // 设置列宽
  ws["!cols"] = [
    { wch: 20 }, // 创建时间
    { wch: 10 }, // 代币
    { wch: 8 }, // 类型
    { wch: 8 }, // 方向
    { wch: 18 }, // 平均价格
    { wch: 18 }, // 价格
    { wch: 15 }, // 已成交
    { wch: 15 }, // 数量
    { wch: 18 }, // 成交额
    { wch: 10 }, // 反向订单
    { wch: 10 }, // 状态
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "订单历史");

  // 生成真正的 XLSX 文件
  const filename = `binance_alpha_orders_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);

  console.log(`✅ Excel 导出完成: ${orders.length} 条记录`);
}

// 生成 CSV
function generateCSV(orders) {
  if (orders.length === 0) return "";

  // 固定列顺序，与页面显示顺序一致
  const headers = [
    "创建时间",
    "代币",
    "类型",
    "方向",
    "平均价格",
    "价格",
    "已成交",
    "数量",
    "成交额",
    "反向订单",
    "状态",
  ];

  let csvContent = headers.join(",") + "\n";

  orders.forEach((order) => {
    const row = headers.map((header) => {
      let value = order[header];

      if (value === null || value === undefined) {
        return "";
      }

      if (typeof value === "object") {
        value = JSON.stringify(value);
      }

      value = String(value);
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        value = '"' + value.replace(/"/g, '""') + '"';
      }

      return value;
    });

    csvContent += row.join(",") + "\n";
  });

  return csvContent;
}

// 旧的 generateExcelHTML 函数已删除，改用 SheetJS 生成真正的 XLSX

// 清空数据 - 重置到插件初始状态
clearBtn.addEventListener("click", () => {
  if (confirm("确定清空数据？")) {
    chrome.storage.local.set({ collectedOrders: [], orderIds: [] }, () => {
      // 重置计数器
      collectedCount = 0;
      updateUI();

      // 禁用导出按钮
      exportCsvBtn.disabled = true;
      exportExcelBtn.disabled = true;

      // 隐藏统计按钮区域
      statsButtonsArea.style.display = "none";
      statsData = null;

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
    exportCsvBtn.disabled = false;
    exportExcelBtn.disabled = false;
    updateStatsUI(); // 数据更新后重新计算统计
  }
});

function updateUI() {
  countEl.textContent = collectedCount;
}

// ==================== 统计UI事件监听器 ====================

// 查看统计按钮
viewStatsBtn.addEventListener("click", () => {
  showStatsDetails();
});

// 导出统计Excel按钮
exportStatsBtn.addEventListener("click", () => {
  if (!statsData) {
    alert("没有统计数据可导出");
    return;
  }

  // ==================== Sheet 1: 统计分析（全部历史数据） ====================
  const statsExportData = [];

  // 第一部分：总计明细
  statsExportData.push(["📊 总计明细"]);
  statsExportData.push(["项目", "金额 (USDT)"]);
  statsExportData.push(["总买入（原始）", statsData.totalBuy.toFixed(2)]);
  statsExportData.push([
    "总买入（加权）",
    statsData.totalWeightedBuy.toFixed(2),
  ]);
  statsExportData.push(["总卖出", statsData.totalSell.toFixed(2)]);
  const wearSign = statsData.wear >= 0 ? "+" : "";
  const wearLabel = statsData.wear < 0 ? "总计（亏损）" : "总计（盈利）";
  statsExportData.push([wearLabel, `${wearSign}${statsData.wear.toFixed(2)}`]);
  statsExportData.push([]); // 空行

  // 第二部分：每日积分明细
  statsExportData.push(["📊 每日积分明细"]);
  statsExportData.push([
    "日期",
    "原始买入 (USDT)",
    "加权买入 (USDT)",
    "积分",
    "状态",
  ]);

  // 按日期倒序排列
  const sortedDates = Object.keys(statsData.dailyPoints).sort().reverse();
  sortedDates.forEach((date) => {
    const data = statsData.dailyPoints[date];
    const status = data.isValid ? "✅有效" : "❌无效";
    const weightedAmount = data.hasUnknownMultiplier
      ? "⚠️未知"
      : data.weightedAmount.toFixed(2);
    const points = data.points !== null ? data.points : "?";
    statsExportData.push([
      date,
      data.originalAmount.toFixed(2),
      weightedAmount,
      points,
      status,
    ]);
  });

  // 总计行
  statsExportData.push([
    "总计（全部）",
    statsData.totalBuy.toFixed(2),
    statsData.totalWeightedBuy.toFixed(2),
    statsData.totalPoints,
    "-",
  ]);
  statsExportData.push([]); // 空行

  // 第三部分：汇总信息
  statsExportData.push(["📊 汇总信息"]);
  statsExportData.push(["历史总积分", statsData.totalPoints + " 分"]);
  statsExportData.push(["历史交易天数", statsData.tradingDays + " 天"]);
  statsExportData.push(["有效积分", statsData.validWindowPoints + " 分"]);
  statsExportData.push(["有效交易天数", statsData.validWindowDays + " 天"]);

  // 创建 Sheet 1
  const ws1 = XLSX.utils.aoa_to_sheet(statsExportData);
  ws1["!cols"] = [
    { wch: 20 }, // 第一列
    { wch: 20 }, // 第二列
    { wch: 20 }, // 第三列
    { wch: 10 }, // 第四列
    { wch: 10 }, // 第五列
  ];

  // ==================== Sheet 2: 有效积分窗口 ====================
  const validWindowData = [];

  // 标题和时间信息
  validWindowData.push([
    `📊 有效积分窗口（${statsData.windowStartDate} ~ ${statsData.windowEndDate}）`,
  ]);
  validWindowData.push([`统计时间：${statsData.currentBjTime} 北京时间`]);
  validWindowData.push([]); // 空行

  // 表头
  validWindowData.push(["日期", "原始买入 (USDT)", "加权买入 (USDT)", "积分"]);

  // 只导出有效窗口内的数据（倒序）
  sortedDates.forEach((date) => {
    const data = statsData.dailyPoints[date];
    if (data.isValid) {
      const weightedAmount = data.hasUnknownMultiplier
        ? "⚠️未知"
        : data.weightedAmount.toFixed(2);
      const points = data.points !== null ? data.points : "?";
      validWindowData.push([
        date,
        data.originalAmount.toFixed(2),
        weightedAmount,
        points,
      ]);
    }
  });

  // 总计行
  validWindowData.push([
    "总计",
    "-",
    statsData.validWindowWeightedBuy.toFixed(2),
    statsData.validWindowPoints,
  ]);
  validWindowData.push([]); // 空行

  // 说明信息
  validWindowData.push(["📝 说明"]);
  validWindowData.push(["• 有效窗口", "最近15天（按14:00分界）"]);
  validWindowData.push(["• 有效积分", statsData.validWindowPoints + " 分"]);
  validWindowData.push(["• 有效交易天数", statsData.validWindowDays + " 天"]);
  validWindowData.push([
    "• 加权买入金额",
    statsData.validWindowWeightedBuy.toFixed(2) + " USDT",
  ]);

  // 创建 Sheet 2
  const ws2 = XLSX.utils.aoa_to_sheet(validWindowData);
  ws2["!cols"] = [
    { wch: 20 }, // 第一列
    { wch: 20 }, // 第二列
    { wch: 20 }, // 第三列
    { wch: 12 }, // 第四列
  ];

  // ==================== Sheet 3: 币种明细 ====================
  const coinDetailsData = [];

  // 标题
  coinDetailsData.push(["📊 币种交易明细"]);
  coinDetailsData.push(["统计时间：" + statsData.currentBjTime + " 北京时间"]);
  coinDetailsData.push([]); // 空行

  // 表头
  coinDetailsData.push([
    "日期",
    "币种",
    "原始金额 (USDT)",
    "倍数",
    "加权金额 (USDT)",
    "状态",
  ]);

  // 遍历每日数据，展开币种明细
  sortedDates.forEach((date) => {
    const dayData = statsData.dailyPoints[date];
    const status = dayData.isValid ? "✅有效" : "❌无效";

    // 获取该日期的所有币种
    const coins = dayData.coins || {};
    const coinNames = Object.keys(coins).sort();

    coinNames.forEach((coinName) => {
      const coinData = coins[coinName];
      const multiplier =
        coinData.multiplier !== null ? coinData.multiplier + "x" : "?";
      const weightedAmount =
        coinData.multiplier !== null
          ? coinData.weightedAmount.toFixed(2)
          : "未知";

      coinDetailsData.push([
        date,
        coinName,
        coinData.amount.toFixed(2),
        multiplier,
        weightedAmount,
        status,
      ]);
    });
  });

  // 创建 Sheet 3
  const ws3 = XLSX.utils.aoa_to_sheet(coinDetailsData);
  ws3["!cols"] = [
    { wch: 15 }, // 日期
    { wch: 12 }, // 币种
    { wch: 18 }, // 原始金额
    { wch: 10 }, // 倍数
    { wch: 18 }, // 加权金额
    { wch: 10 }, // 状态
  ];

  // ==================== 创建工作簿 ====================
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, "统计分析（全部）");
  XLSX.utils.book_append_sheet(wb, ws2, "有效积分窗口");
  XLSX.utils.book_append_sheet(wb, ws3, "币种明细");

  // 生成文件名
  const filename = `binance_alpha_statistics_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);

  console.log("✅ 统计Excel导出完成（含币种明细）");
});

// 关闭弹窗按钮
closeModalBtn.addEventListener("click", () => {
  statsModal.style.display = "none";
});

// 点击弹窗背景关闭
statsModal.addEventListener("click", (e) => {
  if (e.target === statsModal) {
    statsModal.style.display = "none";
  }
});

// ==================== 倍数输入弹窗事件监听器 ====================

// 关闭倍数弹窗
closeMultiplierModalBtn.addEventListener("click", () => {
  multiplierModal.style.display = "none";
});

// 取消按钮
cancelMultiplierBtn.addEventListener("click", () => {
  multiplierModal.style.display = "none";
});

// 保存按钮
saveMultiplierBtn.addEventListener("click", async () => {
  const newMultipliers = {};

  // 收集所有输入的倍数
  unknownCoins.forEach((coin) => {
    const select = document.getElementById(`multiplier_${coin}`);
    if (select) {
      newMultipliers[coin] = parseInt(select.value);
    }
  });

  // 保存到管理器
  await multiplierManager.setMultipliers(newMultipliers);

  console.log("✅ 已保存倍数:", newMultipliers);

  // 关闭弹窗
  multiplierModal.style.display = "none";

  // 重新计算统计（触发更新）
  updateStatsUI();

  alert(
    `✅ 已保存 ${
      Object.keys(newMultipliers).length
    } 个币种的倍数，请重新查看统计`
  );
});

// 点击弹窗背景关闭
multiplierModal.addEventListener("click", (e) => {
  if (e.target === multiplierModal) {
    multiplierModal.style.display = "none";
  }
});
