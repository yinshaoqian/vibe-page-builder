<template>
  <div class="flex-1 flex overflow-hidden">
    <!-- 左侧边栏：文件列表 + 绑定清单 -->
    <aside class="w-56 bg-surface-card border-r border-border flex flex-col shrink-0">
      <!-- 组件文件列表 -->
      <div class="border-b border-border">
        <div class="px-3 py-2.5 flex items-center justify-between">
          <span class="text-xs font-medium uppercase tracking-wider text-text-secondary">组件文件</span>
        </div>
        <div class="px-2 pb-2 space-y-0.5">
          <button v-for="f in componentFiles" :key="f.name"
            class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm transition-colors text-left"
            :class="activeFile === f.name ? 'bg-blue-50 text-brand font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'"
            @click="activeFile = f.name">
            <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            <span class="truncate">{{ f.name }}</span>
          </button>
        </div>
      </div>
      <!-- 绑定清单 -->
      <div class="flex-1 flex flex-col min-h-0">
        <div class="px-3 py-2.5 flex items-center justify-between shrink-0">
          <span class="text-xs font-medium uppercase tracking-wider text-text-secondary">绑定清单</span>
          <span v-if="bindings.length" class="text-xs text-text-secondary bg-surface-bg px-1.5 py-0.5 rounded">{{ bindings.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
          <div v-for="b in bindings" :key="b.id"
            class="binding-item flex items-center gap-2 px-2.5 py-1.5 rounded-md text-sm cursor-default transition-all"
            :class="hoveredBindingId === b.id ? 'bg-blue-50 ring-2 ring-brand/30' : 'bg-surface-bg/50 hover:bg-surface-bg'"
            @mouseenter="hoveredBindingId = b.id"
            @mouseleave="hoveredBindingId = null">
            <span class="text-xs font-mono text-brand shrink-0">{{ b.elTag }}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-text-secondary">{{ b.eventType }}</span>
            <button @click="removeBinding(b.id)" class="ml-auto p-0.5 rounded hover:bg-red-50 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div v-if="!bindings.length" class="text-xs text-text-secondary text-center py-6">暂无绑定</div>
        </div>
      </div>
    </aside>

    <!-- 主编辑区 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 子 Tab 条 -->
      <div class="h-11 bg-surface-card border-b border-border flex items-center px-4 gap-1 shrink-0">
        <button v-for="t in editorTabs" :key="t.key"
          class="px-3 py-1.5 rounded-md text-sm transition-colors"
          :class="activeEditorTab === t.key ? 'bg-blue-50 text-brand font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'"
          @click="activeEditorTab = t.key">
          {{ t.label }}
        </button>
        <div class="ml-auto flex items-center gap-2">
          <button @click="showExportModal = true" class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-brand rounded-lg hover:bg-blue-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            导出组件
          </button>
        </div>
      </div>

      <!-- 编辑内容区 + 右侧预览 -->
      <div class="flex-1 flex min-h-0">
        <!-- 编辑面板 -->
        <div class="flex-1 overflow-y-auto p-4 min-w-0">
          <!-- 文本多语言 -->
          <div v-if="activeEditorTab === 'i18n'">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-sm font-semibold text-text-primary">多语言翻译表</h2>
              <button @click="addI18nKey" class="flex items-center gap-1 px-3 py-1.5 text-sm text-brand border border-brand/30 rounded-lg hover:bg-blue-50 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                添加文本
              </button>
            </div>
            <!-- 语言 Tab -->
            <div class="flex items-center gap-1 mb-3 flex-wrap">
              <button v-for="lang in availableLanguages" :key="lang.code"
                class="px-2.5 py-1 text-xs rounded-md border transition-colors"
                :class="activeLang === lang.code ? 'border-brand bg-blue-50 text-brand font-medium' : 'border-border text-text-secondary hover:bg-surface-bg'"
                @click="activeLang = lang.code">
                {{ lang.code }}
              </button>
            </div>
            <div class="bg-surface-card rounded-lg border border-border overflow-hidden">
              <div class="grid grid-cols-[120px_1fr_36px] gap-0">
                <div class="px-3 py-2 text-xs font-medium text-text-secondary bg-surface-bg border-b border-border">Key</div>
                <div class="px-3 py-2 text-xs font-medium text-text-secondary bg-surface-bg border-b border-border">{{ activeLang }} 翻译</div>
                <div class="px-3 py-2 text-xs font-medium text-text-secondary bg-surface-bg border-b border-border"></div>
                <template v-for="(entry, idx) in i18nEntries" :key="entry.key">
                  <div class="px-3 py-1.5 border-b border-border last:border-b-0 flex items-center">
                    <code class="text-xs font-mono text-text-primary">{{ entry.key }}</code>
                  </div>
                  <div class="px-3 py-1.5 border-b border-border last:border-b-0 border-l border-border">
                    <input :value="(entry as any)[activeLang]" @input="updateI18n(idx, activeLang, ($event.target as HTMLInputElement).value)"
                      class="w-full px-2 py-1 text-sm border border-border rounded bg-surface-bg text-text-primary placeholder-text-secondary/50" :placeholder="'输入 ' + activeLang + ' 翻译'" />
                  </div>
                  <div class="px-1 py-1.5 border-b border-border last:border-b-0 border-l border-border flex items-center justify-center">
                    <button @click="removeI18nKey(idx)" class="p-1 rounded hover:bg-red-50 text-text-secondary hover:text-red-500 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- 颜色调整 -->
          <div v-if="activeEditorTab === 'color'">
            <h2 class="text-sm font-semibold text-text-primary mb-4">颜色变量调整</h2>
            <div class="space-y-3">
              <div v-for="cv in colorVars" :key="cv.name" class="flex items-center gap-3 bg-surface-card rounded-lg px-4 py-3 border border-border">
                <div class="w-7 h-7 rounded border border-border shrink-0" :style="{ backgroundColor: cv.value }" />
                <div class="flex-1 min-w-0">
                  <span class="text-sm font-mono text-text-primary">{{ cv.name }}</span>
                  <span class="text-xs text-text-secondary ml-2">{{ cv.value }}</span>
                </div>
                <select :value="cv.value" @change="replaceColor(cv.name, ($event.target as HTMLSelectElement).value)"
                  class="px-2 py-1 text-xs border border-border rounded bg-surface-bg text-text-primary">
                  <option value="">自定义</option>
                  <option v-for="pc in presetColors" :key="pc.value" :value="pc.value">{{ pc.label }}</option>
                </select>
                <input type="color" :value="cv.value" @input="updateColorVar(cv.name, ($event.target as HTMLInputElement).value)"
                  class="w-7 h-7 rounded cursor-pointer border border-border p-0.5 shrink-0" />
              </div>
            </div>
          </div>

          <!-- 事件绑定 -->
          <div v-if="activeEditorTab === 'event'">
            <h2 class="text-sm font-semibold text-text-primary mb-1">EventBus 事件绑定</h2>
            <p class="text-xs text-text-secondary mb-4">配置组件模板元素的点击/双击事件，绑定到 EventBus</p>
            <div class="bg-surface-card rounded-lg border border-border p-4 space-y-4">
              <div class="flex items-center gap-3">
                <label class="text-sm text-text-primary shrink-0">EventBus 名称</label>
                <input v-model="eventBusName" class="flex-1 px-3 py-1.5 text-sm border border-border rounded bg-surface-bg text-text-primary font-mono" placeholder="如 $emit" />
              </div>
              <div class="flex items-center gap-3">
                <label class="text-sm text-text-primary shrink-0">事件类型</label>
                <select v-model="defaultEventType" class="px-3 py-1.5 text-sm border border-border rounded bg-surface-bg text-text-primary">
                  <option value="click">click（单击）</option>
                  <option value="dblclick">dblclick（双击）</option>
                </select>
              </div>
              <div>
                <p class="text-xs text-text-secondary mb-2">点击下方按钮激活选取模式，然后在右侧预览区点击选择要绑定的元素</p>
                <button @click="startPicker" :disabled="pickerActive"
                  class="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors"
                  :class="pickerActive ? 'bg-green-50 text-success border border-green-300 cursor-not-allowed' : 'text-white bg-brand hover:bg-blue-600'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                  {{ pickerActive ? '选取中...' : '添加 EventBus' }}
                </button>
              </div>
              <!-- 选取操作区 -->
              <div v-if="selectedElInfo" class="bg-blue-50 rounded-lg p-3 border border-blue-200 space-y-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-medium text-brand">已选中：</span>
                  <code class="text-xs font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{{ selectedElInfo.tag }}</code>
                  <code class="text-xs text-text-secondary">{{ selectedElInfo.id }}</code>
                </div>
                <div class="flex items-center gap-2">
                  <button @click="confirmBinding" class="px-3 py-1 text-xs text-white bg-brand rounded hover:bg-blue-600 transition-colors">确认绑定</button>
                  <button @click="resetPicker" class="px-3 py-1 text-xs text-text-secondary border border-border rounded hover:bg-surface-bg transition-colors">重选</button>
                  <button @click="cancelPicker" class="px-3 py-1 text-xs text-text-secondary border border-border rounded hover:bg-red-50 hover:text-red-500 transition-colors">取消</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧实时预览 -->
        <aside class="w-80 bg-surface-card border-l border-border flex flex-col shrink-0">
          <div class="px-4 py-2.5 border-b border-border flex items-center justify-between shrink-0">
            <span class="text-xs font-medium uppercase tracking-wider text-text-secondary">实时预览</span>
            <div class="flex items-center gap-1">
              <button v-for="mode in previewModes" :key="mode.key"
                class="p-1 rounded transition-colors"
                :class="previewMode === mode.key ? 'bg-blue-50 text-brand' : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'"
                :title="mode.label" @click="previewMode = mode.key">
                <component :is="mode.icon" class="w-4 h-4" />
              </button>
              <!-- 沙箱模式切换 -->
              <span class="w-px h-4 bg-border mx-1"></span>
              <button class="px-2 py-1 text-xs rounded transition-colors"
                :class="sandboxMode ? 'bg-brand text-white' : 'text-text-secondary hover:text-text-primary hover:bg-surface-bg'"
                @click="toggleSandboxMode">
                {{ sandboxMode ? '组件沙箱' : '静态预览' }}
              </button>
            </div>
          </div>
          <div class="flex-1 overflow-y-auto p-4" ref="previewRef">
            <!-- 组件沙箱模式 -->
            <SandboxPreviewPanel v-if="sandboxMode" />
            <!-- 静态预览模式 -->
            <div v-else id="preview-component"
              class="border border-border rounded-lg overflow-hidden transition-all mx-auto"
              :class="previewWidthClass">
              <div class="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center gap-3"
                data-el-id="header" :style="{ backgroundColor: previewHeaderBg }">
                <div class="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-white text-xs font-bold" data-el-id="header-icon">U</div>
                <div class="flex-1">
                  <div class="text-sm font-medium text-white" data-el-id="header-title">{{ getI18nText('title') }}</div>
                  <div class="text-xs text-blue-100" data-el-id="header-desc">{{ getI18nText('description') }}</div>
                </div>
                <button class="px-2.5 py-1 text-xs bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors" data-el-id="header-btn">{{ getI18nText('btn_submit') }}</button>
              </div>
              <div class="p-4 space-y-3" :style="{ backgroundColor: previewBg }">
                <div class="flex items-center gap-3" data-el-id="row-1">
                  <div class="w-10 h-10 rounded-full bg-gray-200 shrink-0" data-el-id="avatar" />
                  <div class="flex-1 space-y-1.5">
                    <div class="h-3 bg-gray-200 rounded w-3/5" data-el-id="skeleton-1" />
                    <div class="h-2.5 bg-gray-100 rounded w-2/5" data-el-id="skeleton-2" />
                  </div>
                  <span class="px-2 py-0.5 text-xs rounded-full bg-green-50 text-success" data-el-id="status-badge">Active</span>
                </div>
                <div class="border-t border-border pt-3 grid grid-cols-3 gap-2" data-el-id="stats-row">
                  <div v-for="s in stats" :key="s.label" class="text-center p-2 rounded-lg bg-gray-50" :data-el-id="'stat-' + s.key">
                    <div class="text-base font-semibold text-text-primary">{{ s.value }}</div>
                    <div class="text-xs text-text-secondary">{{ s.label }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- 导出 Modal -->
    <div v-if="showExportModal" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]" @click.self="showExportModal = false">
      <div class="bg-surface-card rounded-xl shadow-xl w-[720px] max-w-[90vw] max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <h3 class="text-sm font-semibold text-text-primary">导出 Vue 组件</h3>
          <button @click="showExportModal = false" class="p-1 rounded hover:bg-surface-bg text-text-secondary transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-5">
          <pre class="text-xs font-mono bg-gray-900 text-green-400 rounded-lg p-4 overflow-x-auto leading-relaxed">{{ generatedVueCode }}</pre>
        </div>
        <div class="flex items-center gap-2 px-5 py-3 border-t border-border shrink-0 justify-end">
          <button @click="copyCode" class="px-4 py-2 text-sm text-text-secondary border border-border rounded-lg hover:bg-surface-bg transition-colors">复制代码</button>
          <button @click="downloadVue" class="px-4 py-2 text-sm text-white bg-brand rounded-lg hover:bg-blue-600 transition-colors">下载 .vue</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { I18nEntry, EventBinding } from '../types'
import SandboxPreviewPanel from '../components/SandboxPreviewPanel.vue'

// === 文件列表 ===
const activeFile = ref('UserTable.vue')
const sandboxMode = ref(false)
const componentFiles = [
  { name: 'UserTable.vue' },
  { name: 'NavBar.vue' },
  { name: 'DataChart.vue' },
  { name: 'LoginForm.vue' },
  { name: 'SideMenu.vue' },
  { name: 'FooterBar.vue' },
]

// === 编辑器 Tab ===
const editorTabs = [
  { key: 'i18n', label: '文本多语言' },
  { key: 'color', label: '颜色调整' },
  { key: 'event', label: '事件绑定' },
]
const activeEditorTab = ref('i18n')

// === 多语言 ===
const activeLang = ref('zh')
const availableLanguages = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'vn', name: 'Tiếng Việt' },
  { code: 'th', name: 'ไทย' },
  { code: 'ph', name: 'Tagalog' },
]

const i18nEntries = reactive<I18nEntry[]>([
  { key: 'title', zh: '用户表格', en: 'User Table', vn: 'Bảng người dùng', th: 'ตารางผู้ใช้', ph: 'Talaan ng Gumagamit' },
  { key: 'description', zh: '用户数据展示', en: 'User Data Display', vn: 'Hiển thị dữ liệu', th: 'แสดงข้อมูลผู้ใช้', ph: 'Pagpapakita ng Datos' },
  { key: 'placeholder', zh: '请输入搜索关键词', en: 'Please enter search keywords', vn: 'Nhập từ khóa tìm kiếm', th: 'ป้อนคำค้นหา', ph: 'Mangyaring mag-input ng keyword' },
  { key: 'btn_submit', zh: '提交', en: 'Submit', vn: 'Gửi', th: 'ส่ง', ph: 'Isumite' },
  { key: 'btn_cancel', zh: '取消', en: 'Cancel', vn: 'Hủy', th: 'ยกเลิก', ph: 'Kanselahin' },
  { key: 'error_msg', zh: '加载失败，请重试', en: 'Load failed, please retry', vn: 'Tải thất bại', th: 'โหลดไม่สำเร็จ', ph: 'Nabigo ang pag-load' },
])

function addI18nKey() {
  const key = prompt('请输入 Key 名称（如 btn_save）：')
  if (!key) return
  if (i18nEntries.find(e => e.key === key)) { alert('Key 已存在'); return }
  i18nEntries.push({ key, zh: '', en: '', vn: '', th: '', ph: '' })
}

function removeI18nKey(idx: number) {
  if (i18nEntries.length <= 1) return
  i18nEntries.splice(idx, 1)
}

function updateI18n(idx: number, lang: string, value: string) {
  ;(i18nEntries[idx] as any)[lang] = value
}

function getI18nText(key: string) {
  const entry = i18nEntries.find(e => e.key === key)
  if (!entry) return key
  return (entry as any)[activeLang.value] || entry.zh || key
}

// === 颜色调整 ===
interface ColorVariable {
  name: string
  value: string
}
const colorVars = reactive<ColorVariable[]>([
  { name: 'primary', value: '#2F6BFF' },
  { name: 'secondary', value: '#16A37B' },
  { name: 'bg-card', value: '#FFFFFF' },
  { name: 'text-body', value: '#152033' },
  { name: 'border-light', value: '#E6EAF2' },
])

const presetColors = [
  { label: '主色', value: '#2F6BFF' },
  { label: '次级色', value: '#16A37B' },
  { label: '文字色', value: '#152033' },
  { label: '附属1', value: '#F59E0B' },
  { label: '附属2', value: '#8B5CF6' },
  { label: '附属3', value: '#E5484D' },
  { label: '附属4', value: '#637089' },
]

function updateColorVar(name: string, value: string) {
  const v = colorVars.find(c => c.name === name)
  if (v) v.value = value
}

function replaceColor(name: string, value: string) {
  if (!value) return
  updateColorVar(name, value)
}

// 预览区颜色
const previewHeaderBg = computed(() => {
  const primary = colorVars.find(c => c.name === 'primary')
  return primary?.value || '#2F6BFF'
})
const previewBg = computed(() => {
  const bg = colorVars.find(c => c.name === 'bg-card')
  return bg?.value || '#FFFFFF'
})

// === 预览 ===
const previewMode = ref('desktop')
const previewModes = [
  { key: 'mobile', label: '手机', icon: 'span' },
  { key: 'tablet', label: '平板', icon: 'span' },
  { key: 'desktop', label: '桌面', icon: 'span' },
]
const previewWidthClass = computed(() => {
  switch (previewMode.value) {
    case 'mobile': return 'max-w-[320px]'
    case 'tablet': return 'max-w-[600px]'
    default: return 'max-w-full'
  }
})

const stats = [
  { key: 'users', label: '用户', value: '1,284' },
  { key: 'active', label: '活跃', value: '847' },
  { key: 'growth', label: '增长', value: '+12%' },
]

// === 事件绑定 ===
const eventBusName = ref('$emit')
const defaultEventType = ref<'click' | 'dblclick'>('click')
const pickerActive = ref(false)
const selectedElInfo = ref<{ tag: string; id: string } | null>(null)
let bindIdCounter = 0

const bindings = reactive<EventBinding[]>([])
const hoveredBindingId = ref<number | null>(null)
function startPicker() {
  pickerActive.value = true
  selectedElInfo.value = null
}

function resetPicker() {
  selectedElInfo.value = null
}

function cancelPicker() {
  pickerActive.value = false
  selectedElInfo.value = null
}

function confirmBinding() {
  if (!selectedElInfo.value) return
  bindIdCounter++
  bindings.push({
    id: bindIdCounter,
    elId: selectedElInfo.value.id,
    elTag: selectedElInfo.value.tag,
    eventType: defaultEventType.value,
    eventBusName: eventBusName.value,
  })
  pickerActive.value = false
  selectedElInfo.value = null
}

function removeBinding(id: number) {
  const idx = bindings.findIndex(b => b.id === id)
  if (idx > -1) bindings.splice(idx, 1)
}

// 绑定清单 hover 联动高亮
watch(hoveredBindingId, (id) => {
  const previewEl = document.getElementById('preview-component')
  if (!previewEl) return
  // 清除所有高亮
  previewEl.querySelectorAll('[data-el-id]').forEach(el => {
    (el as HTMLElement).style.outline = ''
  })
  if (id === null) return
  const binding = bindings.find(b => b.id === id)
  if (!binding) return
  const target = previewEl.querySelector(`[data-el-id="${binding.elId}"]`) as HTMLElement
  if (target) {
    target.style.outline = '2px solid #2F6BFF'
    target.style.outlineOffset = '1px'
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
})

// 选取模式 - 预览区点击
// 使用 document click 监听
if (typeof window !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (!pickerActive.value) return
    const target = (e.target as HTMLElement).closest('[data-el-id]') as HTMLElement
    if (!target) return
    // 确认是在预览组件内
    if (!document.getElementById('preview-component')?.contains(target)) return
    e.preventDefault()
    e.stopPropagation()
    const elId = target.getAttribute('data-el-id') || ''
    const tag = target.tagName.toLowerCase()
    selectedElInfo.value = { tag, id: elId }
    // 高亮
    document.getElementById('preview-component')?.querySelectorAll('[data-el-id]').forEach(el => {
      (el as HTMLElement).style.outline = ''
    })
    target.style.outline = '2px solid #2F6BFF'
    target.style.outlineOffset = '1px'
  }, true)
}

// === 导出 ===
const showExportModal = ref(false)

const generatedVueCode = computed(() => {
  // 生成 template
  let template = `<template>\n  <div class="component-wrapper">\n`
  template += `    <div class="header">\n`
  template += `      <span>{{ getI18nText('title') }}</span>\n`
  template += `      <button>{{ getI18nText('btn_submit') }}</button>\n`
  template += `    </div>\n  </div>\n</template>\n\n`

  // 生成 script
  let script = `<script setup lang="ts">\n`
  // EventBus 注入
  for (const b of bindings) {
    script += `// EventBus binding: ${b.elTag}#${b.elId} (${b.eventType})\n`
  }
  script += `\nconst i18n = {\n`
  for (const lang of ['zh', 'en', 'vn', 'th', 'ph']) {
    script += `  ${lang}: {\n`
    for (const entry of i18nEntries) {
      const val = (entry as any)[lang] || entry.zh
      script += `    ${entry.key}: '${val}',\n`
    }
    script += `  },\n`
  }
  script += `}\n\n`
  script += `function getI18nText(key: string) {\n`
  script += `  const lang = (window as any).$i18n?.local || 'zh'\n`
  script += `  return i18n[lang]?.[key] || i18n['zh'][key] || key\n`
  script += `}\n\n`

  // 主题 CSS 变量
  script += `const themeVars = {\n`
  for (const cv of colorVars) {
    script += `  '--${cv.name}': '${cv.value}',\n`
  }
  script += `}\n`

  script += `<\/script>\n\n`

  // 生成 style
  let style = `<style scoped>\n`
  style += `.component-wrapper {\n`
  for (const cv of colorVars) {
    style += `  --${cv.name}: ${cv.value};\n`
  }
  style += `}\n</style>`

  return template + script + style
})

function toggleSandboxMode() {
  sandboxMode.value = !sandboxMode.value
}

function copyCode() {
  navigator.clipboard.writeText(generatedVueCode.value).then(() => {
    alert('代码已复制到剪贴板')
  })
}

function downloadVue() {
  const blob = new Blob([generatedVueCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = activeFile.value
  a.click()
  URL.revokeObjectURL(url)
}
</script>