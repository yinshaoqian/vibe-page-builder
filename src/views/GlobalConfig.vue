<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- 左侧分类导航 -->
    <aside class="w-56 bg-surface-card border-r border-border flex flex-col shrink-0">
      <div class="px-3 py-3 border-b border-border">
        <span class="text-xs font-medium uppercase tracking-wider text-text-secondary">配置分类</span>
      </div>
      <nav class="flex-1 overflow-y-auto p-2 space-y-1">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors duration-150 text-left"
          :class="activeCategory === cat.key ? 'bg-blue-50 text-brand font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'"
          @click="activeCategory = cat.key"
        >
          <component :is="cat.icon" class="w-4 h-4 shrink-0" />
          <span>{{ cat.label }}</span>
        </button>
      </nav>
    </aside>

    <!-- 右侧配置面板 -->
    <div class="flex-1 overflow-y-auto p-6">
      <!-- 色彩配置 -->
      <div v-if="activeCategory === 'colors'" class="max-w-2xl">
        <h2 class="text-base font-semibold text-text-primary mb-1">色彩配置</h2>
        <p class="text-sm text-text-secondary mb-6">全局主题颜色将影响所有组件的默认配色</p>

        <div class="space-y-4">
          <div v-for="item in colorItems" :key="item.key"
            class="flex items-center gap-4 bg-surface-card rounded-lg px-4 py-3 border border-border">
            <div class="w-8 h-8 rounded-md border border-border shrink-0" :style="{ backgroundColor: colors[item.key] }" />
            <div class="flex-1 min-w-0">
              <label class="text-sm font-medium text-text-primary block">{{ item.label }}</label>
              <span class="text-xs text-text-secondary">{{ item.desc }}</span>
            </div>
            <input type="color" :value="colors[item.key]" @input="updateColor(item.key, ($event.target as HTMLInputElement).value)"
              class="w-8 h-8 rounded cursor-pointer border border-border p-0.5 shrink-0" />
            <input type="text" :value="colors[item.key]" @input="updateColor(item.key, ($event.target as HTMLInputElement).value)"
              class="w-24 px-2 py-1 text-xs font-mono border border-border rounded bg-surface-bg text-text-primary text-center" />
          </div>
        </div>

        <div class="flex items-center gap-3 mt-8">
          <button @click="resetColors" class="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-bg transition-colors">恢复默认</button>
          <button @click="saveColors" class="px-4 py-2 text-sm text-white bg-brand rounded-lg hover:bg-blue-600 transition-colors">保存配置</button>
        </div>
      </div>

      <!-- 多语言配置 -->
      <div v-if="activeCategory === 'languages'" class="max-w-2xl">
        <h2 class="text-base font-semibold text-text-primary mb-1">多语言配置</h2>
        <p class="text-sm text-text-secondary mb-6">管理支持的语言列表，配置后可在组件模板编辑器中使用</p>

        <div class="bg-surface-card rounded-lg border border-border overflow-hidden">
          <div class="px-4 py-2.5 bg-surface-bg border-b border-border text-xs font-medium text-text-secondary uppercase tracking-wider flex items-center gap-4">
            <span class="flex-1">语言代码</span>
            <span class="flex-1">语言名称</span>
            <span class="w-16 text-center">状态</span>
            <span class="w-16 text-center">操作</span>
          </div>
          <div v-for="(lang) in languages" :key="lang.code"
            class="flex items-center gap-4 px-4 py-2.5 border-b border-border last:border-b-0 hover:bg-surface-bg/50 transition-colors">
            <code class="flex-1 text-sm font-mono text-text-primary">{{ lang.code }}</code>
            <span class="flex-1 text-sm text-text-primary">{{ lang.name }}</span>
            <div class="w-16 flex justify-center">
              <span class="inline-block px-2 py-0.5 rounded text-xs font-medium"
                :class="lang.enabled ? 'bg-green-50 text-success' : 'bg-gray-100 text-text-secondary'">
                {{ lang.enabled ? '启用' : '禁用' }}
              </span>
            </div>
            <div class="w-16 flex justify-center gap-1">
              <button @click="toggleLanguage(lang.code)" class="p-1 rounded hover:bg-surface-bg text-text-secondary hover:text-text-primary transition-colors" title="切换状态">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </button>
              <button v-if="lang.code !== 'zh'" @click="removeLanguage(lang.code)" class="p-1 rounded hover:bg-red-50 text-text-secondary hover:text-red-500 transition-colors" title="删除">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 添加语言 -->
        <div class="mt-4">
          <button v-if="!showAddLang" @click="showAddLang = true"
            class="flex items-center gap-1.5 px-4 py-2 text-sm text-brand border border-brand/30 rounded-lg hover:bg-blue-50 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            添加语言
          </button>
          <div v-else class="flex items-center gap-2 bg-surface-card rounded-lg px-4 py-3 border border-border">
            <input v-model="newLangCode" placeholder="语言代码 (如 ja)" class="w-24 px-2 py-1.5 text-sm border border-border rounded bg-surface-bg text-text-primary placeholder-text-secondary/50" />
            <input v-model="newLangName" placeholder="语言名称 (如 日本語)" class="w-36 px-2 py-1.5 text-sm border border-border rounded bg-surface-bg text-text-primary placeholder-text-secondary/50" />
            <button @click="confirmAddLang" class="px-3 py-1.5 text-sm text-white bg-brand rounded-lg hover:bg-blue-600 transition-colors">确认</button>
            <button @click="showAddLang = false; newLangCode = ''; newLangName = ''" class="px-3 py-1.5 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-bg transition-colors">取消</button>
          </div>
        </div>

        <div class="flex items-center gap-3 mt-6">
          <button @click="saveLanguages" class="px-4 py-2 text-sm text-white bg-brand rounded-lg hover:bg-blue-600 transition-colors">保存语言配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { sendToPlatform } from '../composables/usePostMessage'
import type { ThemeColors, LanguageConfig } from '../types'

const activeCategory = ref('colors')

const categories = [
  { key: 'colors', label: '色彩配置', icon: 'div' },
  { key: 'languages', label: '多语言配置', icon: 'div' },
]

// 颜色配置
const defaultColors: ThemeColors = {
  primary: '#2F6BFF',
  secondary: '#16A37B',
  text: '#152033',
  accent1: '#F59E0B',
  accent2: '#8B5CF6',
  accent3: '#E5484D',
  accent4: '#637089',
}

const colors = reactive<ThemeColors & Record<string, string>>({ ...defaultColors })

const colorItems = [
  { key: 'primary', label: '主色', desc: 'Primary Color' },
  { key: 'secondary', label: '次级色', desc: 'Secondary Color' },
  { key: 'text', label: '文字色', desc: 'Text Color' },
  { key: 'accent1', label: '附属色 1', desc: 'Accent Color 1' },
  { key: 'accent2', label: '附属色 2', desc: 'Accent Color 2' },
  { key: 'accent3', label: '附属色 3', desc: 'Accent Color 3' },
  { key: 'accent4', label: '附属色 4', desc: 'Accent Color 4' },
]

function updateColor(key: string, value: string) {
  ;(colors as any)[key] = value
}

function resetColors() {
  Object.assign(colors, defaultColors)
}

function saveColors() {
  sendToPlatform('save-colors', { colors: { ...colors } })
  alert('颜色配置已保存（postMessage 已发送）')
}

// 多语言配置
const languages = reactive<LanguageConfig[]>([
  { code: 'zh', name: '中文', enabled: true },
  { code: 'en', name: 'English', enabled: true },
  { code: 'vn', name: 'Tiếng Việt', enabled: true },
  { code: 'th', name: 'ไทย', enabled: true },
  { code: 'ph', name: 'Tagalog', enabled: true },
])

const showAddLang = ref(false)
const newLangCode = ref('')
const newLangName = ref('')

function toggleLanguage(code: string) {
  const lang = languages.find(l => l.code === code)
  if (lang) lang.enabled = !lang.enabled
}

function removeLanguage(code: string) {
  const idx = languages.findIndex(l => l.code === code)
  if (idx > -1) languages.splice(idx, 1)
}

function confirmAddLang() {
  if (!newLangCode.value || !newLangName.value) return
  if (languages.find(l => l.code === newLangCode.value)) {
    alert('语言代码已存在')
    return
  }
  languages.push({ code: newLangCode.value, name: newLangName.value, enabled: true })
  newLangCode.value = ''
  newLangName.value = ''
  showAddLang.value = false
}

function saveLanguages() {
  sendToPlatform('save-languages', { languages: languages.map(l => ({ ...l })) })
  alert('语言配置已保存（postMessage 已发送）')
}
</script>