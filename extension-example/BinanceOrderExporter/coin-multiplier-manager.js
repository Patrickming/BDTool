// 币种倍数管理器
class CoinMultiplierManager {
    constructor() {
        this.multipliers = {}; // { 'SVSA': 4, 'BTCX': 2, ... }
        this.lastUpdate = null;
        this.apiUrl = 'https://www.binance.com/bapi/defi/v1/public/wallet-direct/buw/wallet/cex/alpha/all/token/list';
        this.updateInterval = 60 * 60 * 1000; // 1小时
    }

    /**
     * 从币安API获取最新的币种倍数
     * @returns {Promise<boolean>} 是否成功
     */
    async fetchMultipliers() {
        try {
            console.log('🔄 正在从币安API获取币种倍数...');

            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();

            if (result.code !== '000000') {
                throw new Error(`API错误: ${result.message || '未知错误'}`);
            }

            const tokens = result.data || [];

            if (tokens.length === 0) {
                throw new Error('API返回空数据');
            }

            // 更新倍数映射
            this.multipliers = {};
            let count1x = 0, count2x = 0, count4x = 0;

            tokens.forEach(token => {
                const symbol = token.symbol;
                const mulPoint = token.mulPoint || 1;

                this.multipliers[symbol] = mulPoint;

                // 统计分布
                if (mulPoint === 1) count1x++;
                else if (mulPoint === 2) count2x++;
                else if (mulPoint === 4) count4x++;
            });

            this.lastUpdate = Date.now();

            // 保存到storage
            await this.saveToStorage();

            console.log(`✅ 成功获取 ${tokens.length} 个币种倍数`);
            console.log(`   1x: ${count1x}个, 2x: ${count2x}个, 4x: ${count4x}个`);

            return true;

        } catch (error) {
            console.error('❌ 获取币种倍数失败:', error.message);
            return false;
        }
    }

    /**
     * 获取币种的倍数
     * @param {string} symbol - 币种符号
     * @returns {number|null} 倍数，null表示未知
     */
    getMultiplier(symbol) {
        return this.multipliers[symbol] || null;
    }

    /**
     * 手动设置币种倍数
     * @param {string} symbol - 币种符号
     * @param {number} multiplier - 倍数
     */
    async setMultiplier(symbol, multiplier) {
        console.log(`📝 手动设置 ${symbol} 倍数为 ${multiplier}x`);
        this.multipliers[symbol] = multiplier;
        await this.saveToStorage();
    }

    /**
     * 批量设置倍数
     * @param {Object} multipliers - { symbol: multiplier }
     */
    async setMultipliers(multipliers) {
        console.log(`📝 批量设置 ${Object.keys(multipliers).length} 个币种倍数`);
        Object.assign(this.multipliers, multipliers);
        await this.saveToStorage();
    }

    /**
     * 保存到Chrome storage
     */
    async saveToStorage() {
        await chrome.storage.local.set({
            coinMultipliers: this.multipliers,
            multipliersLastUpdate: this.lastUpdate
        });
    }

    /**
     * 从Chrome storage加载
     */
    async loadFromStorage() {
        try {
            const data = await chrome.storage.local.get(['coinMultipliers', 'multipliersLastUpdate']);

            this.multipliers = data.coinMultipliers || {};
            this.lastUpdate = data.multipliersLastUpdate || null;

            if (Object.keys(this.multipliers).length > 0) {
                console.log(`📦 从缓存加载 ${Object.keys(this.multipliers).length} 个币种倍数`);
                return true;
            }

            return false;

        } catch (error) {
            console.error('❌ 从storage加载失败:', error);
            return false;
        }
    }

    /**
     * 检查是否需要更新
     * @returns {boolean}
     */
    shouldUpdate() {
        if (!this.lastUpdate) {
            return true; // 从未更新过
        }

        const elapsed = Date.now() - this.lastUpdate;
        return elapsed > this.updateInterval;
    }

    /**
     * 初始化管理器（加载 + 可选更新）
     * @param {boolean} autoUpdate - 是否自动更新
     * @returns {Promise<boolean>}
     */
    async initialize(autoUpdate = true) {
        console.log('🚀 初始化币种倍数管理器...');

        // 先从缓存加载
        const loaded = await this.loadFromStorage();

        // 如果需要更新
        if (autoUpdate && this.shouldUpdate()) {
            console.log('⏰ 倍数数据已过期，开始更新...');
            await this.fetchMultipliers();
        } else if (!loaded) {
            // 如果缓存为空，必须更新
            console.log('⚠️ 缓存为空，必须获取倍数数据...');
            await this.fetchMultipliers();
        } else {
            const age = Math.floor((Date.now() - this.lastUpdate) / 1000 / 60);
            console.log(`✅ 使用缓存数据（${age}分钟前）`);
        }

        return Object.keys(this.multipliers).length > 0;
    }

    /**
     * 获取所有倍数映射
     * @returns {Object}
     */
    getAllMultipliers() {
        return { ...this.multipliers };
    }

    /**
     * 获取倍数统计
     * @returns {Object}
     */
    getStats() {
        const stats = { total: 0, '1x': 0, '2x': 0, '4x': 0, other: 0 };

        for (const mul of Object.values(this.multipliers)) {
            stats.total++;
            if (mul === 1) stats['1x']++;
            else if (mul === 2) stats['2x']++;
            else if (mul === 4) stats['4x']++;
            else stats.other++;
        }

        return stats;
    }
}

// 导出（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoinMultiplierManager;
}
