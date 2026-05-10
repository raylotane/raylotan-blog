# 基于 Rollup 的 React 多页面构建工具 morejs-cli 解析

## 前言

在现代前端开发中，单页面应用（SPA）是主流方案，但它并非适用于所有场景。对于内容型网站、大型后台管理系统或需要独立部署的模块，多页面应用（MPA）架构依然有不可替代的价值。

最近在做一个多页面 React 项目时，我发现社区中缺乏轻量、零配置的 MPA 构建工具。Webpack 配置繁琐，Vite 虽然快但生态偏向 SPA。于是我动手写了一个工具 —— **morejs-cli**，一个基于 Rollup 的 React MPA 构建工具。

## 什么是 morejs-cli？

morejs-cli 是一个命令行构建工具，它通过约定优于配置的方式，将 `src/pages/` 下的每个子目录视为一个独立页面，自动完成 TypeScript 编译、JSX 转换、CSS Modules 处理、HTML 生成等一系列工作。

使用方式非常简单：

```bash
# 开发模式
morejs-cli --mode development --port 3000

# 生产构建
morejs-cli --mode production
```

## 目录结构约定

morejs-cli 采用约定式目录结构：

```
project/
├── src/
│   └── pages/
│       ├── Home/          # 首页
│       │   ├── index.tsx
│       │   ├── index.css
│       │   └── Header/
│       │       ├── Header.tsx
│       │       └── index.module.css
│       └── About/         # 关于页
│           ├── index.tsx
│           └── index.module.css
```

每个页面目录下的 `index.tsx` 被自动识别为入口文件，最终生成对应的 `dist/Home.html`、`dist/About.html`，每个页面独立加载、独立运行。

## 核心架构设计

### 1. Rollup 作为打包核心

选择 Rollup 而非 Webpack 的主要原因：

- **Tree-shaking 更彻底**：Rollup 基于 ES Module 的静态分析，打包产物更小
- **插件机制简洁**：Rollup 的插件系统设计清晰，易于扩展
- **IIFE 输出**：多页面场景下，每个页面输出独立的 IIFE 包，避免了 Webpack 的 runtime 代码重复

### 2. 虚拟入口插件

传统多页面构建需要在每个页面目录维护一个 HTML 文件和一个 JS 入口。morejs-cli 通过自定义的虚拟入口插件，在内存中动态生成入口代码：

```javascript
// 虚拟生成的入口代码
import App from "./index.tsx";
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
```

这样用户只需要在页面目录下放一个 `index.tsx`，无需关心 HTML 模板和入口配置。这是约定式体验的关键设计。

### 3. 完整的插件流水线

构建流程按照以下顺序组织插件：

1. **虚拟入口插件** — 动态生成入口代码
2. **node-resolve** — 解析 node_modules 中的依赖
3. **PostCSS** — 处理 CSS，包括 CSS Modules 支持
4. **TypeScript** — 编译 TSX/TS 文件
5. **Babel** — 自动 JSX 运行时转换（React 17+ 新特性）
6. **CommonJS** — 转换 CJS 模块
7. **HTML 生成** — 自动注入脚本和样式链接

开发模式下额外附加：
- **serve** — 静态文件服务器
- **livereload** — 文件变更自动刷新

### 4. CSS Modules 开箱即用

通过 `rollup-plugin-postcss` 的 `modules` 选项，自动识别 `.module.css` 文件并启用 CSS Modules：

```css
/* index.module.css */
.header { color: red; }
/* 编译后：.Header__header__aB3cD { color: red; } */
```

全局 CSS 则直接使用普通 `.css` 文件，两者可以混合使用。

### 5. React 运行时分离

每个页面生成的 HTML 通过 CDN 加载 React 和 ReactDOM：

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
```

这种设计让多个页面共享浏览器缓存的 React 运行时，避免每个页面重复打包 React，大幅减小首屏加载体积。

## 关键代码解读

### 构建调度器

核心构建函数位于 `src/index.ts`，流程清晰：

```
build() → 扫描 pages 目录 → 遍历每个页面 → boundler() 单页构建
```

每个页面独立调用 Rollup API 构建，互不干扰。开发模式下使用 `rollup.watch()` 实现文件监听：

```typescript
if (mode === "development") {
  const watcher = rollup.watch({ ...inputOptions, output: outputOptions });
  watcher.on("event", ({ code }) => {
    /* START → BUNDLE_START → BUNDLE_END → END 循环 */
  });
} else {
  const bundle = await rollup.rollup(inputOptions);
  await bundle.write(outputOptions);
}
```

### 插件组装

`src/usePlugins.ts` 是插件配置的中枢，它根据开发/生产模式动态决定启用哪些插件。这种设计保持了主构建逻辑的纯净，插件变更只需修改一处。

## 使用方式

### 安装

```bash
git clone <仓库地址>
cd morejs-cli
npm install
npm link   # 全局注册 morejs-cli 命令
```

### 在项目中使用

```bash
cd your-project
morejs-cli --port 8080 --mode development
```

### 推荐的项目结构

提供一个现成的 demo 项目 `example/morejs-demo`，包含完整的页面示例和组件组织方式，可以直接作为项目模板使用。

## 多种形态的构建方案

项目还提供了 `packages/morejs-lite` —— 一个独立的轻量级版本。它不依赖 CLI，直接通过 Node.js 脚本运行，还额外支持 Less 预处理器。这对于想快速了解构建原理或需要自定义构建流程的开发者来说，是一个很好的参考实现。

## 适用场景

- **内容型网站**：博客、文档站、企业官网，每个页面独立 SEO
- **大型后台系统**：不同功能模块独立部署和迭代
- **微前端过渡方案**：从单体 SPA 向微前端架构迁移的中间态
- **学习构建工具原理**：代码量小，逻辑清晰，适合学习 Rollup 插件开发

## 结语

morejs-cli 是一个专注于 MPA 场景的轻量构建工具。它没有追求大而全的配置能力，而是在约定式、零配置的体验上做到极致。如果你正在做多页面 React 项目，或者想了解 Rollup 插件开发，不妨试一试。

项目地址：https://github.com/raylotane/morejs-cli

---

*本文由 morejs-cli 项目 README 与实际源码分析整理而成。*
