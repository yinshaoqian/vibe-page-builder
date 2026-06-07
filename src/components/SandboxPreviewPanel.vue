<template>
  <div class="sandbox-panel flex flex-col h-full">
    <!-- 顶部工具栏 -->
    <div class="flex items-center gap-2 px-3 py-2 border-b border-border shrink-0">
      <button
        class="px-2.5 py-1 text-xs rounded-md transition-colors"
        :class="mode === 'sandbox' ? 'bg-brand text-white' : 'text-text-secondary hover:bg-surface-bg hover:text-text-primary'"
        @click="mode = 'sandbox'">
        <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
        沙箱预览
      </button>
      <button
        class="px-2.5 py-1 text-xs rounded-md transition-colors"
        :class="mode === 'mock' ? 'bg-brand text-white' : 'text-text-secondary hover:bg-surface-bg hover:text-text-primary'"
        @click="mode = 'mock'">
        <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
        Mock 预览
      </button>
      <div class="flex-1" />
      <button
        v-if="mode === 'sandbox'"
        class="px-2.5 py-1 text-xs rounded-md bg-surface-bg text-text-secondary hover:text-text-primary transition-colors"
        @click="showLoadDialog = true">
        <svg class="w-3.5 h-3.5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        加载组件
      </button>
    </div>

    <!-- Mock 预览内容 -->
    <div v-show="mode === 'mock'" class="flex-1 overflow-y-auto p-4">
      <slot name="mock-preview" />
    </div>

    <!-- 沙箱预览内容 -->
    <div v-show="mode === 'sandbox'" class="flex-1 overflow-y-auto p-3">
      <PreviewSandbox
        ref="sandboxRef"
        :component-def="currentComponentDef"
        :mock-props="currentMockProps"
        :mock-translations="mockTranslations"
        @error="onSandboxError"
      />

      <!-- 加载组件对话框 -->
      <div v-if="showLoadDialog" class="fixed inset-0 bg-black/30 flex items-center justify-center z-[100]" @click.self="showLoadDialog = false">
        <div class="bg-surface-card rounded-xl shadow-xl w-[520px] max-w-[90vw] flex flex-col">
          <div class="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
            <h3 class="text-sm font-semibold text-text-primary">加载组件到沙箱预览</h3>
            <button @click="showLoadDialog = false" class="p-1 rounded hover:bg-surface-bg text-text-secondary transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-medium text-text-secondary mb-1.5">选择内置示例组件</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="demo in demoComponents"
                  :key="demo.name"
                  class="text-left px-3 py-2 rounded-lg border transition-colors"
                  :class="selectedDemo === demo.name ? 'border-brand bg-blue-50 text-brand' : 'border-border hover:border-brand/40 text-text-primary'"
                  @click="loadDemoComponent(demo.name)">
                  <div class="text-xs font-medium">{{ demo.label }}</div>
                  <div class="text-[10px] text-text-secondary mt-0.5">{{ demo.desc }}</div>
                </button>
              </div>
            </div>
            <div class="border-t border-border pt-4">
              <label class="block text-xs font-medium text-text-secondary mb-1.5">或粘贴组件代码</label>
              <textarea
                v-model="pastedCode"
                class="w-full h-[200px] px-3 py-2 text-xs font-mono border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                placeholder="粘贴 Vue 组件代码（Options API）..."
              />
              <button
                class="mt-2 px-4 py-1.5 text-xs bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-40"
                :disabled="!pastedCode.trim()"
                @click="previewPastedCode">
                预览此组件
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef } from 'vue'
import PreviewSandbox from './PreviewSandbox.vue'

defineSlots<{
  'mock-preview'(): void
}>()

const mode = ref<'mock' | 'sandbox'>('mock')

// 沙箱状态
// 沙箱状态 - template ref handled by Vue
const currentComponentDef = shallowRef<any>(null)
const currentMockProps = ref({})
const showLoadDialog = ref(false)
const pastedCode = ref('')
const selectedDemo = ref('')

const mockTranslations = reactive<Record<string, string>>({
  '资料已就绪': '✅ 资料已就绪',
  '只需三步完成贷款': '只需三步完成贷款',
  '申请引导副标题': '信息填写完整即可快速审批',
  '当前选择金额': '当前选择金额',
  '预计期限': '预计期限',
  '货币单位': '元',
  '确认基本信息标题': '确认基本信息',
  '确认基本信息描述': '核对手机号、姓名、身份证号',
  '上传合适证件标题': '上传证件',
  '上传合适证件描述': '拍摄清晰的身份证正反面',
  '提交审核标题': '提交审核',
  '提交审核描述': '系统自动审核，最快 5 分钟',
  '审核透明无隐藏费用': '审核透明，无隐藏费用',
  '信息全程保密': '信息全程保密',
  '可后续跟踪': '可后续跟踪',
  '准备证件提示': '请确保在光线充足的环境下操作',
  '继续填写信息': '继续填写信息',
  '天': '天',
})

// Demo 组件列表
const demoComponents = [
  {
    name: 'Theme3ApplyGuide',
    label: '贷款申请引导',
    desc: 'Theme3ApplyGuide 弹窗组件',
  },
  {
    name: 'UserTable',
    label: '用户表格',
    desc: '数据展示表格组件',
  },
  {
    name: 'NavBar',
    label: '导航栏',
    desc: '顶部导航菜单组件',
  },
  {
    name: 'LoginForm',
    label: '登录表单',
    desc: '含校验的登录表单',
  },
  {
    name: 'DataChart',
    label: '数据图表卡片',
    desc: 'KPI 指标展示',
  },
]

// 加载演示的 Theme3ApplyGuide 组件
function loadDemoComponent(name: string) {
  selectedDemo.value = name
  switch (name) {
    case 'Theme3ApplyGuide': {
      currentComponentDef.value = createTheme3ApplyGuide()
      currentMockProps.value = {
        payload: { amount: 5000, term: 12 },
        // 父组件提供 close 事件
      }
      break
    }
    default:
      // 为其他组件生成简单的 Options API 组件定义
      currentComponentDef.value = createSimpleDemo(name)
  }
}

/**
 * 创建 Theme3ApplyGuide 选项式组件
 * 使用 Vue 3 兼容的 h() 渲染替代 SCSS
 */
function createTheme3ApplyGuide(): any {
  return {
    name: 'Theme3ApplyGuide',
    props: {
      payload: { type: Object, default: () => ({}) },
    },
    data() {
      return {
        steps: [
          { titleKey: '确认基本信息标题', descKey: '确认基本信息描述' },
          { titleKey: '上传合适证件标题', descKey: '上传合适证件描述' },
          { titleKey: '提交审核标题', descKey: '提交审核描述' },
        ],
        tipKeys: ['审核透明无隐藏费用', '信息全程保密', '可后续跟踪'],
      }
    },
    computed: {
      resolvedPayload(): any {
        const self = this as any
        return {
          amount: (self.payload?.amount || 0) as number,
          term: (self.payload?.term || 0) as number,
        }
      },
    },
    mounted() {
      const self = this as any
      // 监听全局语言切换（已有 $root mock）
      self.$root?.$on?.('language-changed', (lang: string) => {
        self.$i18n.locale = lang
      })
    },
    methods: {
      formatAmount(value: number) {
        return Number(value || 0).toLocaleString('zh-CN')
      },
      formatTerm(value: number) {
        if (!value) return '--'
        const self = this as any
        const dayUnit = self.$t('天')
        return value + ' ' + dayUnit
      },
      handleConfirm() {
        const self = this as any
        self.$emit('confirm', { ...self.resolvedPayload })
      },
    },
    emits: ['close', 'confirm'],
    template: `
      <div class="theme3-guide" style="position:relative;background:#f0f5ff;border-radius:12px;overflow:hidden;font-family:system-ui;">
        <div style="padding:24px 18px;background:linear-gradient(180deg,#eff6ff 0%,#ffffff 48%,#f8fbff 100%);">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.08em;">
            {{ $t('资料已就绪') }}
          </p>
          <h2 style="margin:0;font-size:24px;line-height:1.2;color:#0f172a;">
            {{ $t('只需三步完成贷款') }}
          </h2>
          <p style="margin:8px 0 0;font-size:14px;color:#475569;">
            {{ $t('申请引导副标题') }}
          </p>
        </div>
        <div style="display:flex;gap:12px;padding:0 18px;">
          <div style="flex:1;padding:10px 14px;background:white;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <span style="font-size:12px;color:#64748b;">{{ $t('当前选择金额') }}</span>
            <strong style="display:block;font-size:16px;color:#0f172a;margin-top:4px;">{{ formatAmount(resolvedPayload.amount) }} {{ $t('货币单位') }}</strong>
          </div>
          <div style="flex:1;padding:10px 14px;background:white;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
            <span style="font-size:12px;color:#64748b;">{{ $t('预计期限') }}</span>
            <strong style="display:block;font-size:16px;color:#0f172a;margin-top:4px;">{{ formatTerm(resolvedPayload.term) }}</strong>
          </div>
        </div>
        <div style="padding:16px 18px;display:flex;flex-direction:column;gap:12px;">
          <div v-for="(step, idx) in steps" :key="step.titleKey" style="display:flex;gap:12px;align-items:flex-start;padding:12px;background:white;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <span style="font-size:13px;font-weight:700;color:#2563eb;min-width:28px;">0{{ idx+1 }}</span>
            <div>
              <strong style="font-size:13px;color:#0f172a;">{{ $t(step.titleKey) }}</strong>
              <p style="margin:2px 0 0;font-size:12px;color:#64748b;">{{ $t(step.descKey) }}</p>
            </div>
          </div>
        </div>
        <div style="padding:0 18px 16px;display:flex;flex-wrap:wrap;gap:10px;">
          <div v-for="tip in tipKeys" :key="tip" style="display:flex;align-items:center;gap:4px;font-size:12px;color:#475569;">
            <span style="color:#16a34a;font-size:14px;">\u2713</span>
            <span>{{ $t(tip) }}</span>
          </div>
        </div>
        <div style="padding:16px 18px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="margin:0 0 10px;font-size:12px;color:#64748b;">{{ $t('准备证件提示') }}</p>
          <button @click="handleConfirm" style="width:100%;padding:12px;background:#2563eb;color:white;border:0;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
            {{ $t('继续填写信息') }}
          </button>
        </div>
      </div>
    `,
  }
}

/** 为其他组件创建简单的占位 demo */
function createSimpleDemo(name: string): any {
  const labels: Record<string, string> = {
    UserTable: '用户数据表格组件',
    NavBar: '顶部导航菜单栏',
    LoginForm: '用户登录表单（含校验）',
    DataChart: 'KPI 数据图表卡片',
  }
  return {
    name,
    template: `<div style="padding:40px 20px;text-align:center;color:#64748b;font-family:system-ui;">
      <div style="font-size:48px;margin-bottom:12px;">📦</div>
      <div style="font-size:16px;font-weight:600;color:#0f172a;margin-bottom:4px;">${name}</div>
      <div style="font-size:12px;">${labels[name] || '组件'}</div>
    </div>`,
  }
}

/** 解析 .vue SFC 代码，提取 template + script 合并为组件定义 */
function parseSFC(code: string): Record<string, any> | null {
  // 提取 <template> 内容
  const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  const template = templateMatch ? templateMatch[1].trim() : ''

  // 如果是纯 Options API 对象（无 template 标签），直接 eval
  if (!template && !code.includes('<template>')) {
    const obj = new Function('return ' + code)()
    return typeof obj === 'object' ? obj : null
  }

  // 提取 <script> 内容
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    // 有 template 但无 script → 创建一个只有 template 的组件
    return { template }
  }

  const script = scriptMatch[1].trim()

  // 将 `export default` 替换为 `return`，所有辅助函数保留在函数作用域中
  // function getNumberLocale() {} 等函数声明会被 hoist
  const wrappedCode = script.replace(/export\s+default\s*/, 'return ')

  const component = new Function(wrappedCode)()
  if (typeof component !== 'object') return null

  // 合并 template（优先取 <template> 标签中的内容）
  if (template) {
    component.template = template
  }

  return component
}

function previewPastedCode() {
  if (!pastedCode.value.trim()) return
  try {
    const componentDef = parseSFC(pastedCode.value)
    if (componentDef) {
      currentComponentDef.value = componentDef as any
      selectedDemo.value = ''
      showLoadDialog.value = false
    } else {
      alert('无法解析组件代码，请确保包含 export default { ... }')
    }
  } catch (e: any) {
    alert('组件代码解析失败：' + (e.message || String(e)))
  }
}

function onSandboxError(err: string) {
  console.warn('[Sandbox] Preview error:', err)
}
</script>