<template>
  <div class="preview-sandbox relative min-h-[200px]" ref="sandboxRef">
    <!-- 加载态 -->
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
      <div class="flex items-center gap-2 text-sm text-text-secondary">
        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span>渲染预览中...</span>
      </div>
    </div>
    <!-- 错误提示 -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-2">
        <svg class="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-red-700 mb-1">预览渲染异常</p>
          <p class="text-xs text-red-600 font-mono break-all">{{ error }}</p>
        </div>
      </div>
    </div>
    <!-- 空状态 -->
    <div v-if="!componentDef && !error" class="flex items-center justify-center h-48 text-sm text-text-secondary">
      <div class="text-center">
        <svg class="w-8 h-8 mx-auto mb-2 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>
        <p>选择组件以预览</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue'
import { createApp } from 'vue'

const props = defineProps<{
  /** Vue 组件选项对象（Options API 或组件选项） */
  componentDef?: any
  /** 额外注入的 prop 数据 */
  mockProps?: Record<string, any>
  /** 自定义 mock 翻译映射 */
  mockTranslations?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'mounted'): void
  (e: 'error', err: string): void
}>()

const sandboxRef = ref<HTMLDivElement>()
const loading = ref(false)
const error = ref('')

let appInstance: any = null

/**
 * 创建预览所需的所有 Mock 全局属性
 * 解决 $t / $i18n / $root / $emit 等外部依赖报错
 */
function createMockGlobals(app: any, mockTrans?: Record<string, string>) {
  // Mock $t(key) - 返回 key 本身或自定义映射
  app.config.globalProperties.$t = (key: string): string => {
    if (mockTrans && mockTrans[key]) return mockTrans[key]
    return key
  }

  // Mock $i18n - 用于 locale 切换
  const i18nState = { locale: 'zh' }
  app.config.globalProperties.$i18n = i18nState

  // Mock $root - 模拟 Vue 2 的全局事件总线
  const eventHandlers: Record<string, Array<(...args: any[]) => void>> = {}
  app.config.globalProperties.$root = {
    $on: (event: string, handler: (...args: any[]) => void) => {
      if (!eventHandlers[event]) eventHandlers[event] = []
      eventHandlers[event].push(handler)
    },
    $off: (event: string, handler?: (...args: any[]) => void) => {
      if (!handler) {
        delete eventHandlers[event]
      } else if (eventHandlers[event]) {
        eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler)
      }
    },
    $emit: (event: string, ...args: any[]) => {
      if (eventHandlers[event]) {
        eventHandlers[event].forEach((h) => h(...args))
      }
    },
  }

  // 捕获渲染错误
  app.config.errorHandler = (err: any) => {
    const msg = err?.message || String(err)
    error.value = msg
    loading.value = false
    emit('error', msg)
  }

  // 捕获警告
  app.config.warnHandler = (_msg: string) => {
    // 静默处理
  }
}

/**
 * 挂载组件到预览容器
 */
async function mountComponent() {
  if (!sandboxRef.value || !props.componentDef) {
    loading.value = false
    return
  }

  // 卸载之前的实例
  destroyInstance()

  loading.value = true
  error.value = ''

  try {
    // 清空容器
    sandboxRef.value.innerHTML = ''

    // 为预览创建一个独立的 Vue 应用
    appInstance = createApp(props.componentDef)

    // 注入 Mock 全局属性
    createMockGlobals(appInstance, props.mockTranslations)

    // 挂载
    appInstance.mount(sandboxRef.value)
    loading.value = false
    emit('mounted')
  } catch (err: any) {
    const msg = err?.message || String(err)
    error.value = msg
    loading.value = false
    emit('error', msg)
  }
}

function destroyInstance() {
  if (appInstance) {
    try {
      appInstance.unmount()
    } catch {
      // 忽略卸载错误
    }
    appInstance = null
  }
}

watch(
  () => props.componentDef,
  () => {
    nextTick(mountComponent)
  },
  { immediate: false }
)

onUnmounted(() => {
  destroyInstance()
})

// 暴露方法供父组件调用
defineExpose({
  reload: () => nextTick(mountComponent),
  destroy: destroyInstance,
})
</script>