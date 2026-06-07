// 主题颜色配置类型
export interface ThemeColors {
  primary: string
  secondary: string
  text: string
  accent1: string
  accent2: string
  accent3: string
  accent4: string
}

// 多语言条目
export interface I18nEntry {
  key: string
  zh: string
  en: string
  vn: string
  th: string
  ph: string
}

// 语言配置
export interface LanguageConfig {
  code: string
  name: string
  enabled: boolean
}

// EventBus 绑定
export interface EventBinding {
  id: number
  elId: string
  elTag: string
  eventType: 'click' | 'dblclick'
  eventBusName: string
}

// 组件模块
export interface ComponentModule {
  name: string
  description: string
  version: string
  updatedAt: string
}

// 全局配置 JSON 结构（与主平台通信）
export interface GlobalConfigData {
  themeColors: ThemeColors
  languages: LanguageConfig[]
  i18n: Record<string, Record<string, string>>
  bindings: EventBinding[]
}