<template>
  <div class="app-container h-screen flex flex-col overflow-hidden">
    <!-- 顶部 Tab 导航栏 -->
    <header class="h-12 bg-surface-card border-b border-border flex items-center px-4 shrink-0 z-50">
      <div class="flex items-center gap-1 mr-8">
        <svg class="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"/>
        </svg>
        <span class="text-sm font-semibold text-text-primary ml-1.5">搭建器</span>
      </div>
      <nav class="flex items-center gap-1">
        <router-link
          v-for="tab in tabs"
          :key="tab.path"
          :to="tab.path"
          class="tab-link px-3 py-1.5 rounded-md text-sm transition-colors duration-150 text-text-secondary hover:text-text-primary hover:bg-surface-bg"
          exact-active-class="bg-primary/10 text-brand font-medium hover:bg-primary/10 hover:text-brand"
        >
          {{ tab.label }}
        </router-link>
      </nav>
    </header>

    <!-- 主内容区 -->
    <div class="flex-1 flex overflow-hidden">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
const tabs = [
  { path: '/builder', label: '页面搭建' },
  { path: '/component-editor', label: '组件模板' },
  { path: '/global-config', label: '全局配置' },
]
</script>