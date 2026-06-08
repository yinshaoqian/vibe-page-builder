/**
 * 从 SFC 代码中提取 $t('KEY') 多语言 key
 */
export function extractI18nKeys(code: string): string[] {
  const keys = new Set<string>()
  // 匹配 $t('xxx') 和 $t("xxx")
  const regex = /\$t\(\s*(['"])([^'"]+?)\1\s*\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(code)) !== null) {
    keys.add(match[2])
  }
  return Array.from(keys).sort()
}

/**
 * Tailwind v2 常见色名列表
 */
const TAILWIND_COLORS = [
  'slate', 'gray', 'zinc', 'neutral', 'stone',
  'red', 'orange', 'amber', 'yellow', 'lime',
  'green', 'emerald', 'teal', 'cyan', 'sky',
  'blue', 'indigo', 'violet', 'purple', 'fuchsia',
  'pink', 'rose',
]

const TAILWIND_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

/**
 * 从代码中提取的颜色项
 */
export interface ExtractedColor {
  original: string       // 原始文本，如 "#2F6BFF" 或 "text-blue-500"
  value: string          // 颜色值，如 "#2F6BFF"
  type: 'hex' | 'tailwind' | 'css-var' | 'rgba'
  tailwindCategory?: 'text' | 'bg' | 'border' | 'ring' | 'placeholder' | 'other'
}

/**
 * 从 SFC 代码中提取所有颜色引用
 */
export function extractColors(code: string): ExtractedColor[] {
  const colors: ExtractedColor[] = []
  const seen = new Set<string>()

  // 1. 提取 hex 颜色 (#RGB, #RRGGBB, #RRGGBBAA)
  const hexRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g
  let match: RegExpExecArray | null
  while ((match = hexRegex.exec(code)) !== null) {
    const upper = match[0].toUpperCase()
    if (!seen.has(upper)) {
      seen.add(upper)
      colors.push({ original: match[0], value: match[0], type: 'hex' })
    }
  }

  // 2. 提取 rgba/hsla 颜色函数
  const colorFnRegex = /(?:rgba?|hsla?)\([^)]+\)/gi
  while ((match = colorFnRegex.exec(code)) !== null) {
    if (!seen.has(match[0])) {
      seen.add(match[0])
      colors.push({ original: match[0], value: match[0], type: 'rgba' })
    }
  }

  // 3. 提取 Tailwind color class
  // 匹配 text-blue-500, bg-red-100, border-green-300 等
  const twPrefixes = ['text', 'bg', 'border', 'ring', 'placeholder', 'from', 'via', 'to', 'shadow', 'accent', 'caret', 'decoration', 'outline']
  
  for (const prefix of twPrefixes) {
    for (const colorName of TAILWIND_COLORS) {
      for (const shade of TAILWIND_SHADES) {
        const className = `${prefix}-${colorName}-${shade}`
        // 匹配 class 属性中的引用，如 class="...text-blue-500..." 或 :class="..."
        const classRegex = new RegExp(`['"\`]\\s*${prefix}-${colorName}-${shade}\\s*['"\`]`, 'g')
        while ((match = classRegex.exec(code)) !== null) {
          if (!seen.has(className)) {
            seen.add(className)
            // 提取对应的 hex 值
            colors.push({
              original: className,
              value: className,
              type: 'tailwind',
              tailwindCategory: (['text', 'bg', 'border', 'ring', 'placeholder'].includes(prefix)
                ? prefix
                : 'other') as ExtractedColor['tailwindCategory'],
            })
          }
        }
        // 也匹配 :class="{ ... text-blue-500 ... }" 或无引号的情况
        const objRegex = new RegExp(`\\b${prefix}-${colorName}-${shade}\\b`, 'g')
        while ((match = objRegex.exec(code)) !== null) {
          if (!seen.has(className)) {
            seen.add(className)
            colors.push({
              original: className,
              value: className,
              type: 'tailwind',
              tailwindCategory: (['text', 'bg', 'border', 'ring', 'placeholder'].includes(prefix)
                ? prefix
                : 'other') as ExtractedColor['tailwindCategory'],
            })
          }
        }
      }
    }
  }

  // 4. 提取 CSS 变量引用 var(--xxx)
  const cssVarRegex = /var\(--[\w-]+\)/g
  while ((match = cssVarRegex.exec(code)) !== null) {
    if (!seen.has(match[0])) {
      seen.add(match[0])
      colors.push({ original: match[0], value: match[0], type: 'css-var' })
    }
  }

  // 去重 (基于 original)
  const uniqueColors: ExtractedColor[] = []
  const dedupSet = new Set<string>()
  for (const c of colors) {
    if (!dedupSet.has(c.original)) {
      dedupSet.add(c.original)
      uniqueColors.push(c)
    }
  }

  return uniqueColors
}

/**
 * 应用颜色修改回代码
 * @param code 原始代码
 * @param replacements { [original: string]: newValue: string } 映射表
 */
export function applyColorReplacements(code: string, replacements: Record<string, string>): string {
  let result = code
  for (const [original, newValue] of Object.entries(replacements)) {
    // 替换字符串中的颜色引用
    result = result.split(original).join(newValue)
  }
  return result
}

/**
 * 应用多语言翻译更新到代码
 * 代码中没有直接的翻译文本需要替换（$t('key') 不变），
 * 此函数主要用于在代码编辑器中标记哪些 key 被使用了
 */
export function getI18nUsage(code: string): { key: string; occurrences: number }[] {
  const countMap = new Map<string, number>()
  const regex = /\$t\(\s*(['"])([^'"]+?)\1\s*\)/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(code)) !== null) {
    countMap.set(match[2], (countMap.get(match[2]) || 0) + 1)
  }
  return Array.from(countMap.entries())
    .map(([key, occurrences]) => ({ key, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences)
}