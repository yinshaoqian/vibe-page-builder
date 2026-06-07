<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- 左侧组件面板 -->
    <aside class="w-64 bg-surface-card border-r border-border flex flex-col shrink-0">
      <!-- 组件 Tab 切换 -->
      <div class="flex border-b border-border shrink-0">
        <button v-for="t in panelTabs" :key="t.key"
          class="flex-1 px-3 py-2.5 text-xs font-medium text-center transition-colors border-b-2"
          :class="activePanelTab === t.key
            ? 'text-brand border-brand bg-blue-50/30'
            : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-bg'"
          @click="activePanelTab = t.key">
          {{ t.label }}
        </button>
      </div>

      <!-- 基础组件 Tab -->
      <div v-if="activePanelTab === 'basic'" class="flex-1 overflow-y-auto p-2 space-y-1">
        <div v-for="cat in componentCategories" :key="cat.label">
          <button class="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-bg transition-colors"
            @click="cat.expanded = !cat.expanded">
            <span>{{ cat.label }}</span>
            <svg class="w-3.5 h-3.5 transition-transform" :class="cat.expanded ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
          <div v-if="cat.expanded" class="ml-2 mt-0.5 space-y-0.5">
            <div v-for="cmp in cat.components" :key="cmp.name" draggable="true"
              class="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-bg cursor-grab active:cursor-grabbing transition-colors">
              <span v-html="cmp.icon" class="w-4 h-4 shrink-0 flex items-center justify-center text-xs" />
              <span class="truncate">{{ cmp.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 组件模块 Tab -->
      <div v-if="activePanelTab === 'modules'" class="flex-1 overflow-y-auto p-2">
        <button class="w-full flex items-center gap-1.5 px-3 py-2 mb-2 text-sm text-brand border border-brand/30 rounded-lg hover:bg-blue-50 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          导入组件
        </button>
        <div v-for="mod in componentModules" :key="mod.name" draggable="true"
          class="flex items-center gap-2.5 px-3 py-2.5 mb-1 rounded-lg border border-border hover:border-brand/30 hover:bg-blue-50/30 cursor-grab active:cursor-grabbing transition-all group">
          <svg class="w-5 h-5 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium text-text-primary truncate">{{ mod.name }}</div>
            <div class="text-xs text-text-secondary truncate">{{ mod.desc }}</div>
          </div>
          <span class="text-xs text-text-secondary bg-surface-bg px-1.5 py-0.5 rounded shrink-0">v{{ mod.version }}</span>
          <div class="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button class="p-1 rounded hover:bg-surface-bg text-text-secondary hover:text-text-primary"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></button>
            <button class="p-1 rounded hover:bg-red-50 text-text-secondary hover:text-red-500"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
          </div>
        </div>
      </div>

      <!-- 底部快捷操作 -->
      <div class="flex items-center justify-around p-2 border-t border-border shrink-0">
        <button class="flex flex-col items-center gap-0.5 p-1.5 rounded-md hover:bg-surface-bg transition-colors text-text-secondary hover:text-text-primary"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span class="text-[10px]">撤销</span></button>
        <button class="flex flex-col items-center gap-0.5 p-1.5 rounded-md hover:bg-surface-bg transition-colors text-text-secondary hover:text-text-primary"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg><span class="text-[10px]">重做</span></button>
        <button class="flex flex-col items-center gap-0.5 p-1.5 rounded-md hover:bg-surface-bg transition-colors text-text-secondary hover:text-text-primary"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg><span class="text-[10px]">预览</span></button>
        <button @click="handleSave" class="flex flex-col items-center gap-0.5 p-1.5 rounded-md hover:bg-blue-50 transition-colors text-brand"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg><span class="text-[10px]">保存</span></button>
      </div>
    </aside>

    <!-- 画布编辑器 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 画布工具栏 -->
      <div class="h-11 bg-surface-card border-b border-border flex items-center px-4 gap-2 shrink-0">
        <div class="flex items-center gap-1 bg-surface-bg rounded-lg p-0.5 border border-border">
          <button v-for="d in devices" :key="d.key"
            class="px-2.5 py-1 text-xs rounded-md transition-colors"
            :class="activeDevice === d.key ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
            @click="activeDevice = d.key">
            {{ d.label }}
          </button>
        </div>
        <div class="flex items-center gap-1 ml-2">
          <button @click="zoomOut" class="p-1 rounded hover:bg-surface-bg text-text-secondary transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg></button>
          <span class="text-xs text-text-secondary w-10 text-center">{{ zoomLevel }}%</span>
          <button @click="zoomIn" class="p-1 rounded hover:bg-surface-bg text-text-secondary transition-colors"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg></button>
        </div>
        <div class="ml-auto flex items-center gap-2">
          <button @click="handleSave" class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-brand rounded-lg hover:bg-blue-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            保存
          </button>
        </div>
      </div>

      <!-- 画布 -->
      <div class="flex-1 overflow-auto bg-surface-bg p-6 flex items-start justify-center">
        <div class="bg-white rounded-xl shadow-sm border border-border transition-all overflow-hidden"
          :style="{ width: canvasWidth, transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }">
          <!-- Canvas 内容 -->
          <div class="p-6 space-y-4 min-h-[400px]">
            <div class="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-sm text-text-secondary hover:border-brand/50 transition-colors cursor-pointer">
              <svg class="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              拖拽组件到此处
            </div>
            <div v-for="(placed, i) in placedComponents" :key="i"
              class="relative group rounded-lg border border-border p-4 hover:border-brand/50 hover:shadow-sm transition-all cursor-pointer"
              :class="{ 'ring-2 ring-brand': selectedIndex === i }"
              @click="selectedIndex = i">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-text-primary">{{ placed.name }}</span>
                <button @click.stop="removePlaced(i)" class="p-1 rounded hover:bg-red-50 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div class="text-xs text-text-secondary mt-1">点击选中编辑属性</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { sendToPlatform } from '../composables/usePostMessage'

// 组件面板 Tab
const activePanelTab = ref('basic')
const panelTabs = [
  { key: 'basic', label: '基础组件' },
  { key: 'modules', label: '组件模块' },
]

// 基础组件分类
interface ComponentItem { name: string; icon: string }
interface Category { label: string; expanded: boolean; components: ComponentItem[] }

const componentCategories = ref<Category[]>([
  {
    label: '布局组件', expanded: true,
    components: [
      { name: '栅格容器', icon: '▦' },
      { name: '弹性容器', icon: '▢' },
      { name: '卡片容器', icon: '▣' },
    ],
  },
  {
    label: '基础组件', expanded: true,
    components: [
      { name: '按钮', icon: '⚡' },
      { name: '文本', icon: 'T' },
      { name: '图片', icon: '🖼' },
      { name: '图标', icon: '◆' },
    ],
  },
  {
    label: '表单组件', expanded: false,
    components: [
      { name: '输入框', icon: '⌨' },
      { name: '选择器', icon: '▼' },
      { name: '开关', icon: '⬡' },
      { name: '日期选择', icon: '📅' },
    ],
  },
  {
    label: '数据组件', expanded: false,
    components: [
      { name: '表格', icon: '⊞' },
      { name: '列表', icon: '☰' },
      { name: '图表', icon: '📊' },
    ],
  },
])

// 组件模块
const componentModules = [
  { name: 'UserTable.vue', desc: '用户数据表格组件', version: '1.2' },
  { name: 'NavBar.vue', desc: '顶部导航栏组件', version: '2.0' },
  { name: 'DataChart.vue', desc: '数据统计图表组件', version: '1.5' },
  { name: 'LoginForm.vue', desc: '登录表单组件', version: '1.0' },
  { name: 'SidePanel.vue', desc: '侧边面板组件', version: '1.3' },
]

// 画布
const activeDevice = ref('desktop')
const devices = [
  { key: 'mobile', label: '手机' },
  { key: 'tablet', label: '平板' },
  { key: 'desktop', label: '桌面' },
]

const canvasWidth = computed(() => {
  switch (activeDevice.value) {
    case 'mobile': return '375px'
    case 'tablet': return '768px'
    default: return '100%'
  }
})

const zoomLevel = ref(100)
function zoomIn() { if (zoomLevel.value < 200) zoomLevel.value += 10 }
function zoomOut() { if (zoomLevel.value > 50) zoomLevel.value -= 10 }

const placedComponents = ref<{ name: string }[]>([])
const selectedIndex = ref<number | null>(null)

function removePlaced(idx: number) {
  placedComponents.value.splice(idx, 1)
  if (selectedIndex.value === idx) selectedIndex.value = null
}

function handleSave() {
  sendToPlatform('save-builder-config', {
    components: placedComponents.value,
    device: activeDevice.value,
  })
  alert('配置已保存（postMessage 已发送）')
}
</script>