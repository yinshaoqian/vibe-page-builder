/**
 * 解析 .vue SFC 文件，提取 template、script、style
 */
export function parseSFC(code: string): { componentDef: Record<string, any> | null; css: string } | null {
  // 提取 <template> 内容
  const templateMatch = code.match(/<template[^>]*>([\s\S]*?)<\/template>/)
  const template = templateMatch ? templateMatch[1].trim() : ''

  // 提取 <style> 内容（去掉 lang/scoped 等属性，只取内部 CSS）
  const styleMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/)
  const css = styleMatch ? styleMatch[1].trim() : ''

  // 如果是纯 Options API 对象（无 template 标签），直接 eval
  if (!template && !code.includes('<template>')) {
    const obj = new Function('return ' + code)()
    return typeof obj === 'object' ? { componentDef: obj, css } : null
  }

  // 提取 <script> 内容
  const scriptMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!scriptMatch) {
    // 有 template 但无 script → 创建一个只有 template 的组件
    return { componentDef: { template }, css }
  }

  const script = scriptMatch[1].trim()

  // 将 `export default` 替换为 `return`，所有辅助函数保留在函数作用域中
  const wrappedCode = script.replace(/export\s+default\s*/, 'return ')

  const component = new Function(wrappedCode)()
  if (typeof component !== 'object') return null

  if (template) {
    component.template = template
  }

  return { componentDef: component, css }
}