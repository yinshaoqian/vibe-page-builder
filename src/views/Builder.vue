<template>
  <div class="flex-1 flex overflow-hidden bg-[#F6F8FB]">
    <!-- ===== 左侧面板 ===== -->
    <aside class="w-64 bg-white border-r border-[#E6EAF2] flex flex-col shrink-0 shadow-sm z-10">
      <!-- 头部 -->
      <div class="border-b border-[#E6EAF2] px-4 py-3 shrink-0">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold text-[#152033]">组件面板</h2>
          <button @click="handleImport" class="p-1.5 rounded hover:bg-[#F6F8FB] text-[#637089] transition-colors" title="导入组件">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V4"/></svg>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <!-- 布局容器 -->
        <div class="px-3 pt-3 pb-1">
          <button class="flex items-center gap-1.5 text-xs font-medium text-[#637089] hover:text-[#152033] transition-colors" @click="layoutExpanded = !layoutExpanded">
            <svg class="w-3 h-3 transition-transform" :class="layoutExpanded ? 'rotate-90' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            布局容器
          </button>
        </div>
        <div v-if="layoutExpanded" class="px-3 pb-2">
          <div class="flex gap-1.5">
            <div v-for="l in layoutItems" :key="l.name"
              draggable="true"
              @dragstart="onDragLayout(l)"
              class="flex-1 flex flex-col items-center gap-1 py-2 rounded-lg border border-[#E6EAF2] text-[#637089] hover:border-[#2F6BFF]/40 hover:bg-blue-50/20 cursor-grab active:cursor-grabbing transition-all text-xs">
              <span class="text-base">{{ l.icon }}</span>
              <span>{{ l.name }}</span>
            </div>
          </div>
        </div>

        <div class="mx-3 my-2 border-t border-[#E6EAF2]"></div>

        <!-- 组件模块列表 -->
        <div class="px-3 pb-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-medium text-[#637089]">组件模块</span>
            <span class="text-[10px] text-[#637089]">{{ storeComponentFiles.length }} 个</span>
          </div>

          <div v-if="!storeComponentFiles.length" class="text-center py-10">
            <svg class="w-10 h-10 mx-auto mb-2 text-[#E6EAF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            <p class="text-xs text-[#637089]">暂无组件模块</p>
            <p class="text-xs text-[#637089] mt-1">先在「组件模板」中创建</p>
          </div>

          <div v-for="mod in storeComponentFiles" :key="mod.id"
            draggable="true"
            @dragstart="onDragModule(mod)"
            @click="selectModule(mod)"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#E6EAF2] hover:border-[#2F6BFF]/40 hover:bg-blue-50/20 cursor-pointer transition-all group mb-1.5"
            :class="{ 'ring-2 ring-[#2F6BFF] bg-blue-50/30': previewingModule?.id === mod.id }">
            <div class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#2F6BFF] shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-[#152033] truncate">{{ mod.name }}</div>
              <div class="text-xs text-[#637089] truncate">{{ mod.description }}</div>
            </div>
            <span class="text-[10px] text-[#637089] bg-[#F6F8FB] px-1.5 py-0.5 rounded shrink-0">v{{ mod.version }}</span>
            <button @click.stop="removeModule(mod.id)" class="p-1 rounded hover:bg-red-50 text-[#637089] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all shrink-0">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>
    </aside>

    <!-- ===== 画布区域 ===== -->
    <div class="flex-1 flex flex-col min-w-0 relative">
      <!-- 画布工具栏 -->
      <div class="h-12 bg-white border-b border-[#E6EAF2] flex items-center px-4 gap-3 shrink-0">
        <div class="flex items-center gap-1 bg-[#F6F8FB] rounded-lg p-0.5 border border-[#E6EAF2]">
          <button v-for="d in devices" :key="d.key"
            class="px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1.5"
            :class="activeDevice === d.key ? 'bg-white text-[#152033] shadow-sm' : 'text-[#637089] hover:text-[#152033]'"
            @click="activeDevice = d.key">
            <span class="text-xs">{{ d.icon }}</span>
            {{ d.label }}
          </button>
        </div>
        <div class="flex items-center gap-1">
          <button @click="zoomOut" class="p-1.5 rounded hover:bg-[#F6F8FB] text-[#637089]" title="缩小">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/></svg>
          </button>
          <span class="text-xs text-[#637089] w-10 text-center select-none">{{ zoomLevel }}%</span>
          <button @click="zoomIn" class="p-1.5 rounded hover:bg-[#F6F8FB] text-[#637089]" title="放大">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>
        <div class="flex items-center gap-2 ml-auto">
          <span v-if="canvasItems.length" class="text-xs text-[#637089]">{{ canvasItems.length }} 个组件</span>
          <button @click="handleSave" class="flex items-center gap-1.5 px-4 py-1.5 text-sm text-white bg-[#2F6BFF] rounded-lg hover:bg-blue-600 transition-colors shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            保存
          </button>
        </div>
      </div>

      <!-- 画布主体（相对定位容器，浮层基于此定位） -->
      <div class="flex-1 overflow-auto p-6 relative"
        @dragover.prevent="onDragOver"
        @dragleave="onDragLeave"
        @drop="onDrop">
        <div class="flex items-start justify-center min-h-full">
          <div class="bg-white rounded-xl shadow-sm border border-[#E6EAF2] transition-all flex flex-col"
            :style="{ width: canvasWidth, transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', maxHeight: '100%' }">
            <div class="flex-1 min-h-[500px] relative overflow-y-auto">
              <!-- 空状态 -->
              <div v-if="!canvasItems.length"
                class="flex flex-col items-center justify-center py-24 text-center select-none min-h-[500px]"
                :class="dragOver ? 'bg-blue-50/40' : ''">
                <svg class="w-14 h-14 mb-3 text-[#E6EAF2]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"/></svg>
                <p class="text-sm text-[#637089]">拖拽组件模块到此处</p>
                <p class="text-xs text-[#637089] mt-1">或点击左侧模块预览后添加</p>
              </div>

              <!-- 画布上的组件列表 -->
              <div v-if="canvasItems.length" class="p-5 space-y-3">
                <div v-for="(item, i) in canvasItems" :key="item.instanceId"
                  class="relative group rounded-xl border transition-all cursor-pointer"
                  :class="selectedIndex === i
                    ? 'border-[#2F6BFF] ring-2 ring-[#2F6BFF]/20 shadow-md'
                    : 'border-[#E6EAF2] hover:border-[#2F6BFF]/40 hover:shadow-sm'"
                  @click="selectItem(i)">
                  <div class="flex items-center justify-between px-4 py-2 bg-[#F6F8FB] border-b border-[#E6EAF2] rounded-t-xl">
                    <div class="flex items-center gap-2">
                      <span v-if="item.type === 'layout'" class="text-base">{{ getLayoutIcon(item.name) }}</span>
                      <svg v-else class="w-4 h-4 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                      <span class="text-sm font-medium text-[#152033]">{{ item.name }}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded"
                        :class="item.type === 'layout' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-[#2F6BFF]'">
                        {{ item.type === 'layout' ? '容器' : '模块' }}
                      </span>
                    </div>
                    <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button v-if="i > 0" @click.stop="moveItem(i, -1)" class="p-1 rounded hover:bg-white text-[#637089] hover:text-[#152033]" title="上移">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                      </button>
                      <button v-if="i < canvasItems.length - 1" @click.stop="moveItem(i, 1)" class="p-1 rounded hover:bg-white text-[#637089] hover:text-[#152033]" title="下移">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                      <button @click.stop="removeItem(i)" class="p-1 rounded hover:bg-red-50 text-[#637089] hover:text-red-500" title="移除">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </div>
                  </div>
                  <div class="p-4">
                    <div v-if="item.type === 'layout'" class="flex items-center justify-center py-6 text-[#637089]">
                      <div class="text-center">
                        <span class="text-3xl mb-1 block">{{ getLayoutIcon(item.name) }}</span>
                        <span class="text-xs">{{ item.name }}</span>
                        <p class="text-[10px] text-[#637089] mt-1">布局容器 — 可嵌套组件</p>
                      </div>
                    </div>
                    <div v-else-if="item.type === 'module'">
                      <div class="min-h-[60px] rounded-lg overflow-hidden border border-[#E6EAF2]">
                        <ModulePreviewOnCanvas :component-id="item.componentId" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 浮动模块预览浮层（不在右面板，浮于画布右侧）===== -->
        <div v-if="showModulePreview && previewingModule"
          class="absolute top-4 left-4 z-30 w-[375px] bg-white rounded-xl shadow-2xl border border-[#E6EAF2] overflow-hidden transition-all duration-200 flex flex-col"
          style="max-height: calc(100% - 32px);">
          <!-- 预览头部 -->
          <div class="flex items-center justify-between px-4 py-2.5 border-b border-[#E6EAF2] bg-white shrink-0">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-6 h-6 rounded bg-blue-50 flex items-center justify-center text-[#2F6BFF] shrink-0">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
              </div>
              <div class="min-w-0">
                <span class="text-sm font-medium text-[#152033] truncate block">{{ previewingModule.name }}</span>
                <span class="text-[10px] text-[#637089]">v{{ previewingModule.version }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button @click="addModuleToCanvas(previewingModule)" class="flex items-center gap-1 px-2.5 py-1 text-xs text-white bg-[#2F6BFF] rounded-lg hover:bg-blue-600 transition-colors" title="添加到画布">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                添加
              </button>
              <button @click="closeModulePreview" class="p-1 rounded hover:bg-[#F6F8FB] text-[#637089]" title="关闭预览">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
          <!-- 预览内容区域（手机尺寸，内容溢出时滚动） -->
          <div class="flex-1 overflow-y-auto bg-[#F6F8FB]">
            <div class="flex items-center justify-center p-3">
              <div class="bg-white rounded-xl overflow-hidden border border-[#E6EAF2] shadow-sm" style="width: 100%;">
                <div class="bg-[#152033] text-white text-[10px] text-center py-1 rounded-t-xl">预览</div>
                <div class="p-3 min-h-[80px]">
                  <ModulePreviewOnCanvas :component-id="previewingModule.id" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 组件列表抽屉（右下角） ===== -->
        <div class="fixed left-[268px] bottom-4 z-50 flex flex-col items-start">
          <div v-if="showComponentList && canvasItems.length" class="mb-2 bg-white rounded-xl shadow-2xl border border-[#E6EAF2] overflow-hidden transition-all">
            <div class="flex items-center justify-between px-4 py-2.5 border-b border-[#E6EAF2] bg-white">
              <span class="text-sm font-medium text-[#152033]">画布组件列表</span>
              <span class="text-[10px] text-[#637089]">{{ canvasItems.length }} 项</span>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div v-for="(item, i) in canvasItems" :key="item.instanceId"
                class="flex items-center gap-2 px-4 py-2.5 border-b border-[#E6EAF2] last:border-b-0 hover:bg-[#F6F8FB] transition-colors group cursor-pointer"
                :class="{ 'bg-blue-50/30': selectedIndex === i }"
                @click="selectItem(i)">
                <!-- 拖拽手柄 -->
                <div class="cursor-grab active:cursor-grabbing text-[#637089] opacity-40 group-hover:opacity-100 transition-opacity shrink-0">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm6-12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm0 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span v-if="item.type === 'layout'" class="text-xs">{{ getLayoutIcon(item.name) }}</span>
                    <svg v-else class="w-3 h-3 text-[#2F6BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                    <span class="text-sm text-[#152033] truncate">{{ item.name }}</span>
                    <span class="text-[10px] px-1 py-0.5 rounded shrink-0"
                      :class="item.type === 'layout' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-[#2F6BFF]'">
                      {{ item.type === 'layout' ? '容器' : '模块' }}
                    </span>
                  </div>
                </div>
                <!-- 上移 / 下移 / 删除 -->
                <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                  <button v-if="i > 0" @click.stop="moveItem(i, -1)" class="p-1 rounded hover:bg-[#F6F8FB] text-[#637089]" title="上移">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
                  </button>
                  <button v-if="i < canvasItems.length - 1" @click.stop="moveItem(i, 1)" class="p-1 rounded hover:bg-[#F6F8FB] text-[#637089]" title="下移">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                  </button>
                  <button @click.stop="removeItem(i)" class="p-1 rounded hover:bg-red-50 text-[#637089] hover:text-red-500" title="移除">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- 列表切换按钮 -->
          <button @click="showComponentList = !showComponentList"
            class="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-[#E6EAF2] text-[#637089] hover:text-[#152033] hover:shadow-xl transition-all"
            :class="{ 'ring-2 ring-[#2F6BFF]': showComponentList }"
            title="组件列表">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- ===== 右侧信息面板已移除 ===== -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { sendToPlatform } from '../composables/usePostMessage'
import { useComponentStore } from '../composables/useComponentStore'
import type { StoredComponent, CanvasItem } from '../types'
import ModulePreviewOnCanvas from '../components/ModulePreviewOnCanvas.vue'

// ===== 共享存储 =====
const {
  componentFiles: storeComponentFiles,
  getComponent,
  removeComponent: removeStoreComponent,
} = useComponentStore()

// ===== 布局容器 =====
const layoutExpanded = ref(true)
const layoutItems = [
  { name: '栅格容器', icon: '▦' },
  { name: '弹性容器', icon: '▢' },
  { name: '卡片容器', icon: '▣' },
]

function getLayoutIcon(name: string): string {
  const map: Record<string, string> = { '栅格容器': '▦', '弹性容器': '▢', '卡片容器': '▣' }
  return map[name] || '□'
}

// ===== 拖拽 =====
let dragPayload: { type: 'layout' | 'module'; name: string; componentId?: string } | null = null

function onDragLayout(l: { name: string }) {
  dragPayload = { type: 'layout', name: l.name }
}

function onDragModule(mod: StoredComponent) {
  dragPayload = { type: 'module', name: mod.name, componentId: mod.id }
}

// ===== 画布 =====
const dragOver = ref(false)
const canvasItems = ref<CanvasItem[]>([])
let idCounter = 0

function onDragOver() { dragOver.value = true }
function onDragLeave() { dragOver.value = false }

function onDrop() {
  dragOver.value = false
  if (!dragPayload) return
  idCounter++
  const item: CanvasItem = {
    instanceId: 'item_' + idCounter + '_' + Date.now().toString(36),
    componentId: dragPayload.componentId || dragPayload.name,
    name: dragPayload.name,
    type: dragPayload.type,
  }
  canvasItems.value.push(item)
  dragPayload = null
  selectItem(canvasItems.value.length - 1)
}

// ===== 选中与预览（浮层模式） =====
const selectedIndex = ref<number | null>(null)
const previewingModule = ref<StoredComponent | null>(null)
const showModulePreview = ref(false)

function selectModule(mod: StoredComponent) {
  previewingModule.value = mod
  showModulePreview.value = true
  selectedIndex.value = null
}

function closeModulePreview() {
  showModulePreview.value = false
  previewingModule.value = null
}

function selectItem(idx: number) {
  selectedIndex.value = idx
  previewingModule.value = null
  showModulePreview.value = false
}

function addModuleToCanvas(mod: StoredComponent) {
  idCounter++
  canvasItems.value.push({
    instanceId: 'item_' + idCounter + '_' + Date.now().toString(36),
    componentId: mod.id,
    name: mod.name,
    type: 'module',
  })
  selectItem(canvasItems.value.length - 1)
}

// ===== 组件列表抽屉 =====
const showComponentList = ref(false)
watch(canvasItems, () => {
  if (!canvasItems.value.length) showComponentList.value = false
}, { deep: true })

// ===== 画布操作 =====
function removeItem(idx: number) {
  canvasItems.value.splice(idx, 1)
  if (selectedIndex.value === idx) {
    selectedIndex.value = canvasItems.value.length > 0
      ? Math.min(idx, canvasItems.value.length - 1)
      : null
    if (!canvasItems.value.length) {
      showComponentList.value = false
    }
  } else if (selectedIndex.value !== null && selectedIndex.value > idx) {
    selectedIndex.value--
  }
}

function moveItem(idx: number, dir: -1 | 1) {
  const t = idx + dir
  if (t < 0 || t >= canvasItems.value.length) return
  const tmp = canvasItems.value[idx]
  canvasItems.value[idx] = canvasItems.value[t]
  canvasItems.value[t] = tmp
  selectedIndex.value = t
}

function removeModule(id: string) {
  if (!confirm('删除组件 "' + (getComponent(id)?.name || id) + '" ？')) return
  removeStoreComponent(id)
  if (previewingModule.value?.id === id) {
    previewingModule.value = null
    showModulePreview.value = false
  }
}

// ===== 设备 & 缩放（默认手机） =====
const activeDevice = ref('mobile')
const devices = [
  { key: 'mobile', label: '手机', icon: '📱' },
  { key: 'tablet', label: '平板', icon: '📟' },
  { key: 'desktop', label: '桌面', icon: '🖥' },
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
function handleSave() {
  sendToPlatform('save-builder-config', {
    items: canvasItems.value.map(it => ({
      name: it.name,
      type: it.type,
      componentId: it.componentId,
    })),
    device: activeDevice.value,
  })
  alert('配置已保存')
}

function handleImport() {
  alert('导入功能待对接 — 将从主平台读取组件文件')
}
</script>