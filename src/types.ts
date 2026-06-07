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

// 颜色变量
export interface ColorVar {
  name: string
  value: string
}

// 已存储的组件文件（完整数据）
export interface StoredComponent {
  id: string
  name: string
  description: string
  version: string
  updatedAt: string
  template: string
  script: string
  style: string
  i18nEntries: I18nEntry[]
  colorVars: ColorVar[]
  bindings: EventBinding[]
  eventBusName: string
}

// 画布上已放置的组件
export interface PlacedComponent {
  instanceId: string
  componentId: string
  name: string
  type: 'basic' | 'module'
  props?: Record<string, any>
}

// 画布项目（简化版，用于排版搭建器）
export interface CanvasItem {
  instanceId: string
  componentId: string
  name: string
  type: 'layout' | 'module'
}

// 组件模块（列表展示用）
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