# AGENTS.md - Vibe Page Builder

## 项目概览
Vue 3 + Vite + TypeScript + Tailwind CSS 2.x 可视化页面搭建器，嵌入主平台通过 postMessage 通讯。

## 技术栈
- **框架**: Vue 3 (Options API 兼容) + vue-router@4
- **构建**: Vite 8
- **语言**: TypeScript (strict)
- **样式**: Tailwind CSS 2.x (purge, .cjs 配置)
- **沙箱**: `vue/dist/vue.esm-bundler` (全量构建含模板编译器)
- **通讯**: postMessage (`usePostMessage.ts`)

## 目录结构
```
src/
├── App.vue                     # 主布局：顶部 Tab + router-view
├── main.ts                     # 入口 + vue-router 配置
├── types.ts                    # 类型定义
├── composables/
│   ├── usePostMessage.ts       # postMessage 通讯
│   └── useComponentStore.ts    # 共享组件存储（localStorage + postMessage 同步）
├── views/
│   ├── Builder.vue             # 页面搭建器（拖拽组件模块/布局容器到画布）
│   ├── ComponentEditor.vue     # 组件模板编辑器（多语言/颜色/事件绑定/导出）
│   └── GlobalConfig.vue        # 全局配置（主题色/语言管理）
└── components/
    ├── PreviewSandbox.vue      # 组件沙箱（独立 Vue app 实例，Mock $t/$i18n/$root）
    ├── SandboxPreviewPanel.vue # 沙箱面板 UI（加载/粘贴/预览）
    └── ModulePreviewOnCanvas.vue # 画布上模块组件的轻量预览
```

## 关键功能
1. **搭建器** (Builder.vue): 左侧组件面板（布局容器 + 组件模块），画布拖拽放置，设备切换
2. **组件编辑器** (ComponentEditor.vue): 五国语言 tab 切换编辑、颜色调整、EventBus 绑定、导出 .vue
3. **沙箱预览** (PreviewSandbox): 粘贴 SFC 代码，parseSFC 提取 template/script/style 独立渲染
4. **共享存储** (useComponentStore): 组件编辑器保存 → 搭建器即时读取，localStorage 持久化 + postMessage 同步

## 构建与运行
```bash
coze dev     # 开发环境（端口 5000，HMR 6000）
coze build   # 生产构建
coze start   # 生产启动
```

## 重要规则
- 使用 Tailwind CSS v2 (`purge` in config, not `content`)
- PostCSS/Tailwind 配置使用 `.cjs` 扩展名
- 沙箱预览使用 `vue/dist/vue.esm-bundler` (含模板编译器)
- 组件文件通过 `useComponentStore` 共享，非 props 传递
- postMessage 的 Header key 为 `x-session`（主平台鉴权）