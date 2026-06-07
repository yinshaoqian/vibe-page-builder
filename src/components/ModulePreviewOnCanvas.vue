<template>
  <div class="module-preview-on-canvas w-full">
    <div v-if="!componentData" class="flex items-center justify-center py-8 text-xs text-[#637089]">
      未找到组件数据
    </div>
    <div v-else ref="previewRef" class="preview-root w-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { createApp, type App } from 'vue/dist/vue.esm-bundler'
import { useComponentStore } from '../composables/useComponentStore'

const props = defineProps<{ componentId: string }>()
const previewRef = ref<HTMLDivElement | null>(null)
const { getComponent } = useComponentStore()

let appInstance: App<Element> | null = null

const componentData = computed(() => getComponent(props.componentId))

function unmountPreview() {
  if (appInstance) {
    appInstance.unmount()
    appInstance = null
  }
  if (previewRef.value) previewRef.value.innerHTML = ''
}

function mountPreview() {
  unmountPreview()
  const data = componentData.value
  if (!data || !previewRef.value) return

  // 重建组件定义
  let componentDef: any = { template: data.template || '<div>无模板</div>' }

  if (data.script) {
    try {
      const cleaned = data.script.replace(/export\s+default\s*/, 'return ')
      const extra = new Function(cleaned)()
      if (typeof extra === 'object') componentDef = { ...componentDef, ...extra }
    } catch { /* 静默 */ }
  }

  // 创建沙箱 app
  appInstance = createApp(componentDef)
  appInstance.config.errorHandler = (err) => console.warn('[Canvas Preview]', err)
  appInstance.config.globalProperties.$t = (key: string) => key
  appInstance.config.globalProperties.$i18n = { locale: 'zh', local: 'zh' }
  appInstance.config.globalProperties.$root = { $on: () => {} }

  // 注入样式
  if (data.style) {
    const styleEl = document.createElement('style')
    styleEl.className = '__preview_css'
    styleEl.textContent = data.style
    previewRef.value.appendChild(styleEl)
  }

  const mountPoint = document.createElement('div')
  previewRef.value.appendChild(mountPoint)
  appInstance.mount(mountPoint)
}

watch(() => props.componentId, () => { mountPreview() })
onMounted(() => { mountPreview() })
onBeforeUnmount(() => { unmountPreview() })
</script>

<style scoped>
.module-preview-on-canvas :deep(.preview-root) {
  transform-origin: top left;
  overflow: hidden;
}
</style>