# 插件图标

## 图标要求

Chrome Extension 需要以下尺寸的图标：

- **icon16.png** - 16x16px（扩展程序页面图标）
- **icon48.png** - 48x48px（扩展程序管理页面图标）
- **icon128.png** - 128x128px（Chrome Web Store 图标）

## 快速生成图标

您可以使用以下方法生成图标：

### 方法 1：在线图标生成器

访问以下网站：
- https://www.favicon-generator.org/
- https://www.iconfinder.com/
- https://www.flaticon.com/

### 方法 2：使用 Figma/Photoshop

1. 创建 128x128px 画布
2. 设计您的图标（推荐使用 KOL BD Tool 品牌色：#667eea）
3. 导出为 PNG：
   - 128x128px → icon128.png
   - 48x48px → icon48.png
   - 16x16px → icon16.png

### 方法 3：使用 emoji2png (临时方案)

在 Linux/Mac 上：
```bash
# 安装 ImageMagick
sudo apt-get install imagemagick  # Ubuntu/Debian
brew install imagemagick          # macOS

# 生成简单的彩色方块图标
convert -size 128x128 xc:'#667eea' -pointsize 80 -fill white -gravity center -annotate +0+0 'K' icon128.png
convert -size 48x48 xc:'#667eea' -pointsize 30 -fill white -gravity center -annotate +0+0 'K' icon48.png
convert -size 16x16 xc:'#667eea' -pointsize 12 -fill white -gravity center -annotate +0+0 'K' icon16.png
```

## 当前状态

⚠️ **需要添加图标文件**

插件目前缺少图标文件。在添加图标之前，插件仍然可以加载和使用，只是会显示默认图标。

请按照上述方法生成图标并放置在此目录。

## 设计建议

- 使用 KOL BD Tool 品牌色：紫色渐变 (#667eea → #764ba2)
- 图标应该简洁、识别度高
- 建议图案：
  - 字母 "K" 或 "KOL"
  - 📸 相机图标
  - 🎯 目标图标
  - 组合：K + Twitter 鸟

---

*此目录正在等待图标文件*
