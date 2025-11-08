// Background Script: 数据收集和导出

// 监听来自 content script 和 popup 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'collectOrders') {
        collectOrders(message.orders);
    } else if (message.action === 'getOrdersForExport') {
        // 返回订单数据给 popup，由 popup 进行下载
        chrome.storage.local.get(['collectedOrders'], (result) => {
            sendResponse({ orders: result.collectedOrders || [] });
        });
        return true; // 保持消息通道开启
    }
});

// 收集订单数据
async function collectOrders(newOrders) {
    // 从 storage 获取已有数据
    const result = await chrome.storage.local.get(['collectedOrders', 'orderIds']);

    let allOrders = result.collectedOrders || [];
    let orderIds = new Set(result.orderIds || []);

    // 去重添加
    let addedCount = 0;
    newOrders.forEach(order => {
        const orderId = order.orderId || order.id || JSON.stringify(order);
        if (!orderIds.has(orderId)) {
            orderIds.add(orderId);
            allOrders.push(order);
            addedCount++;
        }
    });

    if (addedCount > 0) {
        // 保存到 storage
        await chrome.storage.local.set({
            collectedOrders: allOrders,
            orderIds: Array.from(orderIds)
        });

        // 通知 popup 更新计数
        chrome.runtime.sendMessage({
            action: 'updateCount',
            count: allOrders.length
        });

        console.log(`✅ 新增 ${addedCount} 条订单，总计 ${allOrders.length} 条`);
    }
}

// 导出为 CSV - 直接浏览器下载
async function exportToCSV() {
    const result = await chrome.storage.local.get(['collectedOrders']);
    const orders = result.collectedOrders || [];

    if (orders.length === 0) {
        console.error('没有数据可导出');
        return;
    }

    const csv = generateCSV(orders);
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const filename = `binance_alpha_orders_${new Date().toISOString().slice(0, 10)}.csv`;

    // 直接下载，不弹窗
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false  // 直接下载到默认位置
    }, (downloadId) => {
        console.log(`✅ CSV 导出完成: ${orders.length} 条记录, ID: ${downloadId}`);
        URL.revokeObjectURL(url);
    });
}

// 生成 CSV
function generateCSV(orders) {
    if (orders.length === 0) return '';

    // 获取所有字段
    const allKeys = new Set();
    orders.forEach(order => {
        Object.keys(order).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);

    // 中文表头映射
    const headerMap = {
        'orderId': '订单ID',
        'symbol': '交易对',
        'side': '方向',
        'price': '价格',
        'quantity': '数量',
        'executedQty': '成交数量',
        'cumulativeQuoteQty': '成交金额',
        'status': '状态',
        'type': '类型',
        'timeInForce': '有效方式',
        'createTime': '创建时间',
        'updateTime': '更新时间',
        'fills': '成交明细'
    };

    const csvHeaders = headers.map(h => headerMap[h] || h);
    let csvContent = csvHeaders.join(',') + '\n';

    orders.forEach(order => {
        const row = headers.map(header => {
            let value = order[header];

            if (value === null || value === undefined) {
                return '';
            }

            // 时间戳转换
            if ((header === 'createTime' || header === 'updateTime') && typeof value === 'number') {
                value = new Date(value).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
            }

            // 处理对象
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            // CSV 转义
            value = String(value);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
                value = '"' + value.replace(/"/g, '""') + '"';
            }

            return value;
        });

        csvContent += row.join(',') + '\n';
    });

    return csvContent;
}

// 导出为 Excel - 直接浏览器下载
async function exportToExcel() {
    const result = await chrome.storage.local.get(['collectedOrders']);
    const orders = result.collectedOrders || [];

    if (orders.length === 0) {
        console.error('没有数据可导出');
        return;
    }

    console.log(`📊 准备导出 ${orders.length} 条订单到 Excel`);

    // 使用 HTML table 方式生成 Excel（兼容性好）
    const excelContent = generateExcelHTML(orders);
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const filename = `binance_alpha_orders_${new Date().toISOString().slice(0, 10)}.xls`;

    // 直接下载，不弹窗
    chrome.downloads.download({
        url: url,
        filename: filename,
        saveAs: false  // 直接下载到默认位置
    }, (downloadId) => {
        console.log(`✅ Excel 导出完成: ${orders.length} 条记录, ID: ${downloadId}`);
        URL.revokeObjectURL(url);
    });
}

// 生成 Excel HTML (使用 HTML table 格式，Excel 可以直接打开)
function generateExcelHTML(orders) {
    if (orders.length === 0) return '';

    // 获取所有字段
    const allKeys = new Set();
    orders.forEach(order => {
        Object.keys(order).forEach(key => allKeys.add(key));
    });

    const headers = Array.from(allKeys);

    // 开始构建 HTML
    let html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="utf-8">
    <style>
        table { border-collapse: collapse; width: 100%; }
        th { background-color: #f0b90b; color: white; font-weight: bold; padding: 8px; border: 1px solid #ddd; }
        td { padding: 8px; border: 1px solid #ddd; }
        .number { mso-number-format: "0.00000000"; }
        .text { mso-number-format: "\\@"; }
    </style>
</head>
<body>
    <table>
        <thead>
            <tr>`;

    // 表头
    headers.forEach(header => {
        html += `<th>${header}</th>`;
    });

    html += `
            </tr>
        </thead>
        <tbody>`;

    // 数据行
    orders.forEach(order => {
        html += '<tr>';
        headers.forEach(header => {
            let value = order[header];

            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            } else {
                value = String(value);
            }

            // 判断是数字还是文本
            const isNumber = !isNaN(value) && value !== '';
            const cellClass = isNumber ? 'number' : 'text';

            // HTML 转义
            value = value.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;');

            html += `<td class="${cellClass}">${value}</td>`;
        });
        html += '</tr>';
    });

    html += `
        </tbody>
    </table>
</body>
</html>`;

    return '\uFEFF' + html; // 添加 BOM 以支持中文
}
