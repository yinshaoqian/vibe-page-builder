// 共享组件存储 — 组件编辑器与搭建器共享数据
import { ref } from 'vue'
import type { StoredComponent } from '../types'
import { sendToPlatform, onPlatformMessage } from './usePostMessage'

const STORAGE_KEY = 'coze-component-store'

// 模块级单例（跨组件/页面共享）
const componentFiles = ref<StoredComponent[]>([])
const isLoading = ref(false)

// 从 localStorage 加载
function loadFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as StoredComponent[]
      componentFiles.value = parsed
    }
  } catch {
    // 静默忽略
  }
}

// 保存到 localStorage
function saveToLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(componentFiles.value))
  } catch {
    // 静默忽略
  }
}

// 添加或更新组件
function saveComponent(comp: StoredComponent) {
  const idx = componentFiles.value.findIndex(c => c.id === comp.id)
  if (idx > -1) {
    componentFiles.value[idx] = { ...comp, updatedAt: new Date().toISOString() }
  } else {
    componentFiles.value.push({
      ...comp,
      id: comp.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      updatedAt: new Date().toISOString(),
    })
  }
  saveToLocal()
  syncToPlatform()
}

// 删除组件
function removeComponent(id: string) {
  componentFiles.value = componentFiles.value.filter(c => c.id !== id)
  saveToLocal()
  syncToPlatform()
}

// 按 name 查找
function getComponent(id: string): StoredComponent | undefined {
  return componentFiles.value.find(c => c.id === id)
}

function getComponentByName(name: string): StoredComponent | undefined {
  return componentFiles.value.find(c => c.name === name)
}

// 同步到主平台
function syncToPlatform() {
  sendToPlatform('save-components', {
    components: componentFiles.value.map(c => ({
      id: c.id,
      name: c.name,
      description: c.description,
      version: c.version,
      updatedAt: c.updatedAt,
    })),
  })
}

// 请求主平台下发完整数据
function requestFromPlatform() {
  isLoading.value = true
  sendToPlatform('request-config', { type: 'component-store' })
}

// 从主平台加载完整数据
function loadFromPlatformData(data: { components: any[] }) {
  if (data.components) {
    componentFiles.value = data.components as StoredComponent[]
    saveToLocal()
  }
  isLoading.value = false
}

// 初始化：尝试本地加载 + 监听平台消息
let cleanup: (() => void) | null = null

function init() {
  loadFromLocal()
  cleanup = onPlatformMessage((msg) => {
    if (msg.type === 'load-component-store' && msg.payload?.components) {
      loadFromPlatformData(msg.payload as { components: any[] })
    }
  })
  // 请求主平台数据（如果已嵌入）
  requestFromPlatform()
}

function dispose() {
  cleanup?.()
}

// 初始化
init()

export function useComponentStore() {
  return {
    componentFiles,
    isLoading,
    saveComponent,
    removeComponent,
    getComponent,
    getComponentByName,
    saveToLocal,
    loadFromLocal,
    syncToPlatform,
    requestFromPlatform,
    dispose,
  }
}