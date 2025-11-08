// DOM 提取方案：直接从页面提取已显示的订单数据
(function() {
    if (window.__BINANCE_DOM_EXTRACTOR_INJECTED__) {
        console.log('⚠️ DOM提取脚本已运行');
        return;
    }
    window.__BINANCE_DOM_EXTRACTOR_INJECTED__ = true;

    console.log('✅✅✅ 币安订单 DOM 提取器已启动 ✅✅✅');
    console.log('📍 当前页面URL:', window.location.href);
    console.log('📍 时间:', new Date().toLocaleString());

    // 方法1：从表格 DOM 提取数据
    function extractFromTable() {
        console.log('🔍 尝试从表格DOM提取订单...');

        const orders = [];

        // 查找所有可能的表格行
        const rows = document.querySelectorAll('table tbody tr, .order-row, [class*="order"], [class*="history"]');

        console.log(`📊 找到 ${rows.length} 个可能的订单行`);

        rows.forEach((row, index) => {
            try {
                const cells = row.querySelectorAll('td, [class*="cell"]');

                // 调试：打印每行的单元格数量和内容
                if (index === 0) {
                    console.log(`📊 表格列数: ${cells.length}`);
                    console.log('📋 表头内容:', Array.from(cells).map((c, i) => `[${i}]: ${c.textContent.trim()}`));
                }

                // 必须至少有12列（包括展开按钮列）才是有效的订单行
                if (cells.length >= 12) {
                    // 币安页面第一列是展开按钮，所以索引+1
                    // 实际映射：cells[1]=创建时间, cells[2]=代币, cells[3]=类型...
                    const orderData = {
                        创建时间: cells[1]?.textContent?.trim() || '',
                        代币: cells[2]?.textContent?.trim() || '',
                        类型: cells[3]?.textContent?.trim() || '',
                        方向: cells[4]?.textContent?.trim() || '',
                        平均价格: cells[5]?.textContent?.trim() || '',
                        价格: cells[6]?.textContent?.trim() || '',
                        已成交: cells[7]?.textContent?.trim() || '',
                        数量: cells[8]?.textContent?.trim() || '',
                        成交额: cells[9]?.textContent?.trim() || '',
                        反向订单: cells[10]?.textContent?.trim() || '',
                        状态: cells[11]?.textContent?.trim() || ''
                    };

                    // 过滤表头行和空数据
                    const isHeaderRow = (
                        orderData.代币 === '代币' ||
                        orderData.创建时间 === '创建时间' ||
                        orderData.代币 === '创建时间' || // 检测到你的情况
                        orderData.方向 === '方向' ||
                        orderData.类型 === '类型'
                    );

                    // 更严格的验证：必须同时满足多个条件
                    const hasValidData = (
                        // 必须有创建时间且包含日期格式
                        orderData.创建时间 &&
                        (orderData.创建时间.includes('-') || orderData.创建时间.includes('/') || orderData.创建时间.includes(':')) &&
                        // 必须有代币名称且至少2个字符
                        orderData.代币 &&
                        orderData.代币.length >= 2 &&
                        orderData.代币 !== '代币' &&
                        // 必须有方向（买入或卖出）
                        orderData.方向 &&
                        (orderData.方向 === '买入' || orderData.方向 === '卖出' || orderData.方向.includes('买') || orderData.方向.includes('卖')) &&
                        // 必须有状态
                        orderData.状态 &&
                        orderData.状态.length >= 2
                    );

                    if (!isHeaderRow && hasValidData) {
                        orders.push(orderData);
                        console.log(`✅ 提取订单 ${orders.length}:`, orderData);
                    } else if (isHeaderRow) {
                        console.log(`⏭️ 跳过表头行 ${index + 1}`);
                    } else if (cells.length >= 12 && !hasValidData) {
                        console.log(`⏭️ 跳过无效行 ${index + 1}（数据不符合订单格式）`);
                    }
                } else if (cells.length > 0) {
                    console.log(`⏭️ 跳过行 ${index + 1}（列数不足: ${cells.length}）`);
                }
            } catch (err) {
                console.log(`⚠️ 提取第 ${index + 1} 行失败:`, err.message);
            }
        });

        return orders;
    }

    // 方法2：从 React/Vue 状态提取
    function extractFromReactState() {
        console.log('🔍 尝试从 React/Vue 状态提取...');

        try {
            // 查找所有 DOM 节点的 React Fiber
            const allElements = document.querySelectorAll('*');

            for (let el of allElements) {
                const keys = Object.keys(el);

                for (let key of keys) {
                    if (key.startsWith('__reactFiber') || key.startsWith('__reactProps')) {
                        try {
                            const fiber = el[key];
                            const jsonStr = JSON.stringify(fiber);

                            if (jsonStr.includes('orderId') || jsonStr.includes('orderHistory')) {
                                console.log('🎯 找到可能包含订单的 React 状态！');
                                console.log('🔑 Key:', key);

                                // 尝试提取数据
                                const match = jsonStr.match(/"data":\[(.*?)\]/);
                                if (match) {
                                    console.log('📦 找到数据数组！');
                                    return JSON.parse('[' + match[1] + ']');
                                }
                            }
                        } catch (err) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        } catch (err) {
            console.log('⚠️ React状态提取失败:', err.message);
        }

        return [];
    }

    // 方法3：监听 DOM 变化（已禁用，避免频繁输出）
    function observeDOMChanges() {
        // 不再监听 DOM 变化，避免控制台刷屏
        console.log('⏭️ DOM 监听已禁用（避免频繁日志）');
        return null;
    }

    // 主提取函数
    window.extractOrdersFromDOM = function() {
        console.log('🚀🚀🚀 开始提取订单数据 🚀🚀🚀');

        // 尝试方法1: 表格提取
        let orders = extractFromTable();

        if (orders.length > 0) {
            console.log(`🎉🎉🎉 成功从表格提取到 ${orders.length} 条订单！`);

            // 发送到 background
            chrome.runtime.sendMessage({
                action: 'collectOrders',
                orders: orders
            }, (response) => {
                console.log('✅ 数据已发送到后台');
            });

            return { success: true, count: orders.length, orders: orders };
        }

        // 尝试方法2: React状态
        orders = extractFromReactState();

        if (orders.length > 0) {
            console.log(`🎉🎉🎉 成功从 React 状态提取到 ${orders.length} 条订单！`);

            chrome.runtime.sendMessage({
                action: 'collectOrders',
                orders: orders
            });

            return { success: true, count: orders.length, orders: orders };
        }

        console.log('❌ 未能提取到订单数据');
        console.log('💡 提示：请确保你在"历史委托"标签页，并且能看到订单列表');

        return { success: false, message: '未找到订单数据' };
    };

    // 监听来自 popup 的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'extractFromDOM') {
            console.log('📨 收到提取请求');
            const result = window.extractOrdersFromDOM();
            sendResponse(result);
            return true; // 保持消息通道开启
        }
    });

    // 启动 DOM 监听
    const domObserver = observeDOMChanges();

    console.log('📡 DOM 提取器准备就绪！');
    console.log('💡 调用 window.extractOrdersFromDOM() 即可提取当前页面的订单');

})();
