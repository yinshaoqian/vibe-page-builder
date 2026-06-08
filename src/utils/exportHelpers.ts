/**
 * 导出工具函数集——独立文件避免 SFC 解析器误判模板/脚本标签
 */

export interface BindingItem {
  elementId: string
  elementTag: string
  event: 'click' | 'dblclick'
  action: string
}

export interface I18nEntry {
  key: string
  values: Record<string, string>
}

export interface ColorVar {
  original: string
  type: 'hex' | 'tailwind' | 'css-var' | 'rgba'
  group: string
  replacement: string
}

/**
 * 解析 .vue SFC 代码为组件定义
 */
export function parseSFC(code: string): { componentDef: Record<string, any> | null; css: string } | null {
  const tplOpen = '<' + 'template' + '>'
  const tplClose = '</' + 'template' + '>'
  const scriptClose = '</' + 'script' + '>'
  const styleClose = '</' + 'style' + '>'

  // 提取 <template> 内容
  const tplStart = code.indexOf(tplOpen)
  const tplEnd = code.indexOf(tplClose)
  const template = (tplStart >= 0 && tplEnd > tplStart)
    ? code.slice(tplStart + tplOpen.length, tplEnd).trim()
    : ''

  // 提取 <style> 内容
  const styleTagStart = code.indexOf('<' + 'style')
  const styleTagEnd = code.indexOf(styleClose)
  const css = (styleTagStart >= 0 && styleTagEnd > styleTagStart)
    ? code.slice(code.indexOf('>', styleTagStart) + 1, styleTagEnd).trim()
    : ''

  // 如果是纯 Options API 对象
  if (!template && !code.includes(tplOpen)) {
    try {
      const obj = new Function('return ' + code)()
      return typeof obj === 'object' ? { componentDef: obj, css } : null
    } catch { return null }
  }

  // 提取 <script> 内容
  const scriptTagStart = code.indexOf('<' + 'script')
  const scriptTagEnd = code.indexOf(scriptClose)
  let componentDef: Record<string, any> | null = null

  if (scriptTagStart >= 0 && scriptTagEnd > scriptTagStart) {
    const scriptContent = code.slice(code.indexOf('>', scriptTagStart) + 1, scriptTagEnd).trim()
    const wrappedCode = scriptContent.replace(/export\s+default\s*/, 'return ')
    try {
      componentDef = new Function(wrappedCode)()
      if (typeof componentDef !== 'object') componentDef = null
    } catch { componentDef = null }
  }

  if (template && componentDef) {
    componentDef.template = template
  }

  return { componentDef, css }
}

/**
 * 从代码中提取 <script> 内容
 */
export function extractScript(code: string): string {
  const scriptTagStart = code.indexOf('<' + 'script')
  const scriptClose = '</' + 'script' + '>'
  const scriptTagEnd = code.indexOf(scriptClose)
  if (scriptTagStart >= 0 && scriptTagEnd > scriptTagStart) {
    const contentStart = code.indexOf('>', scriptTagStart) + 1
    return code.slice(contentStart, scriptTagEnd).trim()
  }
  return ''
}

/**
 * 从代码中提取 $t('XXX') 翻译 key
 */
export function extractI18nKeys(code: string): string[] {
  const regex = /\$t\(\s*['"]([^'"]+)['"]\s*\)/g
  const keys: string[] = []
  let match
  while ((match = regex.exec(code)) !== null) {
    if (!keys.includes(match[1])) keys.push(match[1])
  }
  return keys
}

/** 常见 Tailwind color group 名称 */
const TAILWIND_COLORS = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose', 'white', 'black',
]

/** 常见 Tailwind color weight */
const TAILWIND_WEIGHTS = [
  '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950',
]

/**
 * 从代码中提取所有颜色（hex + Tailwind classes）
 */
export function extractColors(code: string): ColorVar[] {
  const result: ColorVar[] = []
  const seen = new Set<string>()

  // 1. Hex 颜色
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g
  let m: RegExpExecArray | null
  while ((m = hexRegex.exec(code)) !== null) {
    const key = m[0]
    if (!seen.has(key)) {
      seen.add(key)
      result.push({
        original: key,
        type: 'hex',
        group: 'hex',
        replacement: key,
      })
    }
  }

  // 2. Tailwind color classes
  const twRegex = new RegExp(
    `(?:text|bg|border|ring|outline|placeholder|from|via|to|shadow|accent|caret|decoration)-(?:` +
    TAILWIND_COLORS.join('|') +
    `)-(?:` +
    TAILWIND_WEIGHTS.join('|') +
    `)\\b`,
    'g'
  )
  while ((m = twRegex.exec(code)) !== null) {
    const key = m[0]
    if (!seen.has(key)) {
      seen.add(key)
      const parts = key.split('-')
      const groupIdx = TAILWIND_COLORS.indexOf(parts[1])
      result.push({
        original: key,
        type: 'tailwind',
        group: groupIdx >= 0 ? parts[1] : 'other',
        replacement: key,
      })
    }
  }

  // 3. rgba/hsla 函数
  const fnRegex = /(?:rgba?|hsla?)\([^)]+\)/g
  while ((m = fnRegex.exec(code)) !== null) {
    const key = m[0]
    if (!seen.has(key)) {
      seen.add(key)
      result.push({
        original: key,
        type: 'rgba',
        group: 'rgba',
        replacement: key,
      })
    }
  }

  return result
}

/**
 * 生成导出的 .vue 代码
 */
export function generateExportCode(
  template: string,
  script: string,
  style: string,
  bindings: BindingItem[],
  _eventBusName: string,
  code: string,
): string {
  const tplOpen = '<' + 'template' + '>'
  const tplClose = '</' + 'template' + '>'
  const scriptOpen = '<' + 'script' + '>'
  const scriptClose = '</' + 'script' + '>'

  // 如果有原始代码，优先基于原始代码注入事件
  if (code && code.includes(tplOpen)) {
    // 解析模板并注入事件
    let modifiedTemplate = template
    for (const b of bindings) {
      const attr = b.event === 'click' ? '@click' : '@dblclick'
      modifiedTemplate = modifiedTemplate.replaceAll(
        b.elementTag,
        b.elementTag.replace('>', ` ${attr}="\${emitEvent('${b.action}')}" >`)
      )
    }

    // 注入事件 emit 函数到 script
    let modifiedScript = script || 'export default { methods: {} }'
    const emitFn = `\n  function emitEvent(action) { if (typeof \$EventBus !== 'undefined') \$EventBus.\$emit(action) }\n`

    if (modifiedScript.includes('methods:')) {
      modifiedScript = modifiedScript.replace(
        'methods:',
        `methods: { ${emitFn.trim()}`
      )
    }

    const parts = [tplOpen + '\n' + modifiedTemplate + '\n' + tplClose]
    if (modifiedScript.trim()) {
      parts.push(scriptOpen + '\n' + modifiedScript + '\n' + scriptClose)
    }
    if (style) {
      parts.push('<' + 'style scoped' + '>\n' + style + '\n</' + 'style' + '>')
    }
    return parts.join('\n\n')
  }

  // 无原始代码，拼接各部分
  const parts: string[] = []
  if (template) parts.push(tplOpen + '\n' + template + '\n' + tplClose)
  if (script) parts.push(scriptOpen + '\n' + script + '\n' + scriptClose)
  if (style) parts.push('<' + 'style scoped' + '>\n' + style + '\n</' + 'style' + '>')
  return parts.join('\n\n')
}

/**
 * 复制导出代码到剪贴板
 */
export async function copyExportCode(
  template: string,
  script: string,
  style: string,
  bindings: BindingItem[],
  eventBusName: string,
  code: string,
): Promise<boolean> {
  const exportCode = generateExportCode(template, script, style, bindings, eventBusName, code)
  try {
    await navigator.clipboard.writeText(exportCode)
    return true
  } catch {
    return false
  }
}