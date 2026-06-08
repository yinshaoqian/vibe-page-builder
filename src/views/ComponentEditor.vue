<template>
  <div class="flex-1 flex overflow-hidden bg-surface-bg">
    <!-- ====== 左侧面板：文件列表 + 绑定清单 ====== -->
    <aside class="w-56 bg-surface-card border-r border-border flex flex-col shrink-0 select-none">
      <!-- 组件文件列表 -->
      <div class="flex flex-col flex-1 min-h-0">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <span class="text-sm font-semibold text-text-primary">组件模块</span>
          <button @click="createNewFile" class="text-xs px-2 py-0.5 rounded bg-brand text-white hover:bg-brand/90 transition-colors">+ 新建</button>
        </div>
        <div class="flex-1 overflow-y-auto">
          <div
            v-for="file in storeFiles"
            :key="file.id"
            @click="loadFile(file)"
            class="group flex items-center justify-between px-4 py-2.5 mx-2 mt-1 rounded-lg cursor-pointer transition-colors"
            :class="activeFileId === file.id ? 'bg-brand/10 text-brand' : 'hover:bg-gray-50 text-text-primary'"
          >
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-4 h-4 shrink-0" :class="activeFileId === file.id ? 'text-brand' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div class="min-w-0">
                <div class="text-xs font-medium truncate">{{ file.name }}</div>
                <div class="text-[10px] text-text-secondary truncate">{{ file.description || '无描述' }}</div>
              </div>
            </div>
            <button
              v-if="activeFileId === file.id"
              @click.stop="deleteFile(file.id)"
              class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all shrink-0"
              title="删除"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"/></svg>
            </button>
          </div>
          <div v-if="storeFiles.length === 0" class="flex flex-col items-center justify-center py-12 text-text-secondary/50">
            <svg class="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m5 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/></svg>
            <span class="text-xs">暂无组件</span>
          </div>
        </div>
      </div>

      <!-- 事件绑定清单（仅当有当前文件时展示） -->
      <div v-if="activeFileId" class="border-t border-border">
        <div class="px-4 py-2.5 border-b border-border">
          <span class="text-sm font-semibold text-text-primary">事件绑定清单</span>
        </div>
        <div class="overflow-y-auto max-h-40">
          <div
            v-for="(binding, idx) in bindings"
            :key="idx"
            @mouseenter="highlightBinding(idx)"
            @mouseleave="clearBindingHighlight(idx)"
            class="group flex items-center gap-2 px-4 py-1.5 text-xs text-text-secondary hover:bg-gray-50 cursor-pointer transition-colors border-b border-border/50 last:border-0"
          >
            <svg class="w-3 h-3 shrink-0 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10h5l-4 8v-6h-5l4-8v6z"/></svg>
            <span class="truncate flex-1">
              <span class="text-gray-400">{{ binding.elementTag || 'div' }}</span>
              <span class="text-brand ml-1">@{{ binding.event || 'click' }}</span>
            </span>
            <button @click.stop="removeBinding(idx)" class="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all" title="删除绑定">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <div v-if="bindings.length === 0" class="px-4 py-4 text-center text-xs text-text-secondary/50">暂无绑定</div>
        </div>
      </div>
    </aside>

    <!-- ====== 主内容区域 ====== -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 顶部工具栏 -->
      <div class="h-11 bg-surface-card border-b border-border flex items-center justify-between px-4 shrink-0">
        <div class="flex items-center gap-1">
          <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            <button
              v-for="tab in editorTabs"
              :key="tab.key"
              @click="activeEditorTab = tab.key"
              class="px-3 py-1.5 text-xs font-medium rounded-md transition-all"
              :class="activeEditorTab === tab.key ? 'bg-white text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
            >{{ tab.label }}</button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="saveFile"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-md text-xs font-medium hover:bg-brand/90 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
            保存
          </button>
          <button
            @click="showExportModal = true"
            class="flex items-center gap-1.5 px-3 py-1.5 border border-border text-text-primary rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
            导出
          </button>
        </div>
      </div>

      <!-- 主内容：上沙箱 + 下标签 -->
      <div class="flex-1 flex flex-col min-h-0">
        <!-- ====== 上：沙箱预览（主区域） ====== -->
        <div class="flex-1 min-h-[300px] border-b border-border overflow-hidden">
          <PreviewSandbox
            v-if="sandboxComponentDef || !activeFileId"
            :componentDef="sandboxComponentDef"
            :styles="sandboxCss"
            :mockProps="sandboxMockProps"
            :mockTranslations="sandboxTranslations"
          />
          <div v-else class="h-full flex items-center justify-center text-sm text-text-secondary/50">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z"/></svg>
              <p>粘贴代码到下方「代码编辑」标签</p>
              <p class="text-xs mt-1">点击「预览」按钮即可展示</p>
            </div>
          </div>
        </div>

        <!-- ====== 下：标签内容 ====== -->
        <div class="flex-1 min-h-[200px] overflow-y-auto bg-white">
          <!-- 代码编辑 Tab -->
          <div v-show="activeEditorTab === 'code'" class="h-full flex flex-col">
            <div class="flex items-center justify-between px-4 py-2 border-b border-border shrink-0">
              <span class="text-xs font-semibold text-text-primary">SFC 代码编辑</span>
              <div class="flex items-center gap-2">
                <button
                  @click="previewFromCode"
                  class="flex items-center gap-1.5 px-3 py-1.5 bg-brand text-white rounded-md text-xs font-medium hover:bg-brand/90 transition-colors"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0 0 10 9.87v4.263a1 1 0 0 0 1.555.832l3.197-2.132a1 1 0 0 0 0-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg>
                  预览
                </button>
              </div>
            </div>
            <div class="flex-1 p-4">
              <textarea
                v-model="codeEditorContent"
                @paste="onCodePaste"
                @input="onCodeChange"
                class="w-full h-full font-mono text-sm p-4 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand bg-white text-text-primary"
                placeholder="在此粘贴或编辑 .vue 组件代码 ..."
                spellcheck="false"
              ></textarea>
            </div>
          </div>

          <!-- 多语言 Tab -->
          <div v-show="activeEditorTab === 'i18n'" class="p-4 h-full overflow-y-auto">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-sm font-semibold text-text-primary">文本多语言</h3>
                <p class="text-xs text-text-secondary mt-0.5">自动从代码中提取 $t('key')，共 {{ i18nKeys.length }} 个</p>
              </div>
              <div class="flex items-center gap-2">
                <select v-model="editLang" class="text-xs border border-border rounded px-2 py-1 bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20">
                  <option v-for="lang in languages" :key="lang.key" :value="lang.key">{{ lang.label }}</option>
                </select>
                <button
                  @click="reExtractI18n"
                  class="text-xs px-3 py-1.5 border border-border rounded-md text-text-secondary hover:bg-gray-50 transition-colors"
                >
                  从代码重新提取
                </button>
                <button
                  @click="fillAllLanguages"
                  class="text-xs px-3 py-1.5 bg-brand/10 text-brand rounded-md hover:bg-brand/20 transition-colors"
                >
                  一键填充 (预留)
                </button>
              </div>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-xs">
                <thead>
                  <tr class="border-b border-border">
                    <th class="text-left py-2 px-3 text-text-secondary font-medium w-1/3">$t('Key')</th>
                    <th class="text-left py-2 px-3 text-text-secondary font-medium">{{ getLanguageLabel(editLang) }}</th>
                    <th class="text-left py-2 px-3 text-text-secondary font-medium w-16">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(entry, idx) in filteredI18nEntries" :key="entry.key" class="border-b border-border/50 hover:bg-gray-50/50">
                    <td class="py-2 px-3">
                      <code class="text-brand bg-brand/5 px-1.5 py-0.5 rounded text-[11px]">$t('{{ entry.key }}')</code>
                    </td>
                    <td class="py-2 px-3">
                      <input
                        v-model="entry.values[editLang]"
                        :placeholder="editLang === 'zh' ? '输入翻译' : '待翻译'"
                        class="w-full px-2 py-1.5 border border-border rounded-md bg-white text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                      />
                    </td>
                    <td class="py-2 px-3">
                      <button
                        @click="removeI18nKey(idx)"
                        class="text-gray-300 hover:text-red-400 transition-colors"
                        title="移除此 key"
                      >
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filteredI18nEntries.length === 0">
                    <td colspan="3" class="py-8 text-center text-text-secondary/50">
                      <p>未从代码中提取到 $t('key')</p>
                      <p class="text-xs mt-1">在代码编辑器中使用 $t('你的文本') 后重新提取</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 颜色调整 Tab -->
          <div v-show="activeEditorTab === 'color'" class="p-4 h-full overflow-y-auto">
            <div class="flex items-center justify-between mb-3">
              <div>
                <h3 class="text-sm font-semibold text-text-primary">颜色变量调整</h3>
                <p class="text-xs text-text-secondary mt-0.5">自动从代码中提取颜色引用，共 {{ extractedColors.length }} 项</p>
              </div>
              <button
                @click="reExtractColors"
                class="text-xs px-3 py-1.5 border border-border rounded-md text-text-secondary hover:bg-gray-50 transition-colors"
              >
                从代码重新提取
              </button>
            </div>

            <div class="space-y-2">
              <!-- 按类型分组 -->
              <div v-for="group in colorGroups" :key="group.label" class="mb-4">
                <h4 class="text-xs font-medium text-text-secondary mb-2 flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" :class="group.badgeClass"></span>
                  {{ group.label }} ({{ group.items.length }})
                </h4>

                <div class="grid grid-cols-2 gap-2">
                  <div
                    v-for="(item, _idx) in group.items"
                    :key="_idx"
                    class="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-border/50"
                  >
                    <!-- 色块预览 -->
                    <div
                      class="w-7 h-7 rounded-md border border-border/50 shrink-0"
                      :style="{ backgroundColor: isHexColor(item.value) ? item.value : tailwindToHex(item.value) }"
                    ></div>

                    <div class="flex-1 min-w-0">
                      <code class="text-[11px] text-text-primary truncate block">{{ item.original }}</code>
                      <span v-if="item.type === 'tailwind'" class="text-[10px] text-text-secondary">{{ item.tailwindCategory }} 类</span>
                    </div>

                    <input
                      type="color"
                      :value="isHexColor(item.value) ? item.value : '#2F6BFF'"
                      @input="onColorChange(item, ($event.target as HTMLInputElement).value)"
                      class="w-6 h-6 p-0 border-0 rounded cursor-pointer shrink-0"
                    />
                  </div>
                </div>
              </div>

              <div v-if="extractedColors.length === 0" class="py-8 text-center text-text-secondary/50">
                <p>未从代码中提取到颜色</p>
                <p class="text-xs mt-1">在代码编辑器中粘贴包含颜色值的代码后重新提取</p>
              </div>
            </div>
          </div>

          <!-- 事件绑定 Tab -->
          <div v-show="activeEditorTab === 'event'" class="p-4 h-full overflow-y-auto">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-text-primary">事件绑定</h3>
              <div class="flex items-center gap-2">
                <label class="text-xs text-text-secondary">EventBus 名称:</label>
                <input
                  v-model="eventBusName"
                  class="w-28 px-2 py-1 border border-border rounded text-xs bg-white text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  placeholder="$EventBus"
                />
              </div>
            </div>

            <!-- 选取器模式 -->
            <div class="flex items-center gap-2 mb-4">
              <button
                @click="startElementPicker"
                class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                :class="pickerActive ? 'bg-brand text-white ring-2 ring-brand/30' : 'border border-border text-text-secondary hover:bg-gray-50'"
              >
                <svg class="w-4 h-4" :class="pickerActive ? 'animate-pulse' : ''" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"/></svg>
                {{ pickerActive ? '选取中... 点击预览中的元素' : '选取元素绑定' }}
              </button>
              <span v-if="pickerActive" class="text-xs text-yellow-600 animate-pulse">🟡 鼠标移到预览元素上高亮，点击选定</span>
            </div>

            <!-- 临时选取状态 -->
            <div v-if="pendingBinding" class="flex items-center gap-3 mb-4 p-3 bg-brand/5 border border-brand/20 rounded-lg">
              <div class="flex items-center gap-2 text-xs text-text-primary">
                <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
                <span>已选定: <code class="font-mono bg-white px-1 py-0.5 rounded border border-border">{{ pendingBinding.tagName || 'div' }}</code></span>
              </div>
              <div class="flex items-center gap-2 ml-auto">
                <select v-model="pendingBinding.event" class="text-xs border border-border rounded px-2 py-1 bg-white text-text-primary">
                  <option value="click">@click</option>
                  <option value="dblclick">@dblclick</option>
                </select>
                <button @click="confirmBinding" class="px-3 py-1.5 bg-success text-white rounded-md text-xs font-medium hover:opacity-90 transition-opacity">确认</button>
                <button @click="cancelBinding" class="px-3 py-1.5 border border-border text-text-secondary rounded-md text-xs hover:bg-gray-50 transition-colors">取消</button>
                <button @click="restartPicker" class="px-3 py-1.5 border border-border text-text-secondary rounded-md text-xs hover:bg-gray-50 transition-colors">重选</button>
              </div>
            </div>

            <!-- 绑定列表 -->
            <div class="border border-border rounded-lg overflow-hidden">
              <div class="px-3 py-2 bg-gray-50 border-b border-border text-xs font-medium text-text-secondary">已绑定事件</div>
              <div v-for="(binding, _idx) in bindings" :key="_idx"
                class="flex items-center gap-3 px-3 py-2.5 border-b border-border/50 last:border-0 hover:bg-gray-50/50 transition-colors"
                @mouseenter="highlightBinding(_idx)"
                @mouseleave="clearBindingHighlight(_idx)"
              >
                <span class="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-xs font-bold">{{ _idx + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <code class="text-xs text-text-primary font-mono">{{ binding.elementTag || 'div' }}</code>
                  <span class="text-brand text-xs ml-2">@{{ binding.event || 'click' }}</span>
                  <span v-if="binding.elementId" class="text-[10px] text-text-secondary ml-2">#{{ binding.elementId }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <button
                    @click="editBindingEvent(_idx)"
                    class="px-2 py-1 text-[10px] text-text-secondary border border-border rounded hover:bg-white transition-colors"
                  >
                    编辑
                  </button>
                  <button @click="removeBinding(_idx)" class="px-2 py-1 text-[10px] text-red-300 hover:text-red-500 border border-border rounded hover:bg-white transition-colors">
                    删除
                  </button>
                </div>
              </div>
              <div v-if="bindings.length === 0" class="py-6 text-center text-xs text-text-secondary/50">
                暂无事件绑定
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ====== 导出弹窗 ====== -->
    <div v-if="showExportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30" @click.self="showExportModal = false">
      <div class="bg-white rounded-xl shadow-xl w-[640px] max-h-[80vh] flex flex-col" @click.stop>
        <div class="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 class="text-sm font-semibold text-text-primary">导出 .vue 组件</h3>
          <button @click="showExportModal = false" class="text-gray-300 hover:text-text-primary transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-5">
          <textarea
            :value="exportVueCode"
            class="w-full h-80 font-mono text-xs p-4 border border-border rounded-lg resize-none bg-gray-50 text-text-primary focus:outline-none"
            readonly
            spellcheck="false"
          ></textarea>
        </div>
        <div class="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-gray-50">
          <button @click="copyExportCode" class="px-4 py-2 border border-border text-text-primary rounded-lg text-xs font-medium hover:bg-white transition-colors">
            复制代码
          </button>
          <button @click="downloadExportFile" class="px-4 py-2 bg-brand text-white rounded-lg text-xs font-medium hover:bg-brand/90 transition-colors">
            下载 .vue 文件
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import PreviewSandbox from '../components/PreviewSandbox.vue'
import { useComponentStore } from '../composables/useComponentStore'
import { parseSFC } from '../utils/parseSFC'
import { extractI18nKeys, extractColors, type ExtractedColor } from '../utils/codeAnalysis'

// ====== Store ======
const { componentFiles: storeFiles, saveComponent, removeComponent } = useComponentStore()

// ====== 状态 ======
const activeFileId = ref<string | null>(null)
const activeEditorTab = ref('code') // 'code' | 'i18n' | 'color' | 'event'

const editorTabs = [
  { key: 'code', label: '代码编辑' },
  { key: 'i18n', label: '文本多语言' },
  { key: 'color', label: '颜色调整' },
  { key: 'event', label: '事件绑定' },
]

// ====== 代码编辑 ======
const codeEditorContent = ref('')
const i18nKeys = ref<string[]>([])
const extractedColors = ref<ExtractedColor[]>([])

// ====== 沙箱预览 ======
const sandboxComponentDef = ref<any>(null)
const sandboxCss = ref('')
const sandboxMockProps = ref<Record<string, any>>({})
const sandboxTranslations = ref<Record<string, string>>({})

// ====== 多语言 ======
interface I18nEntry {
  key: string
  values: Record<string, string>
}

const editLang = ref('zh')
const i18nEntries = ref<I18nEntry[]>([])

const languages = [
  { key: 'zh', label: '中文' },
  { key: 'en', label: 'English' },
  { key: 'vn', label: 'Tiếng Việt' },
  { key: 'th', label: 'ภาษาไทย' },
  { key: 'ph', label: 'Filipino' },
]

function getLanguageLabel(key: string) {
  return languages.find(l => l.key === key)?.label || key
}

const filteredI18nEntries = computed(() => i18nEntries.value)

// ====== 颜色调整 ======
const colorGroups = computed(() => {
  const groups: { label: string; badgeClass: string; items: ExtractedColor[] }[] = []

  const hexColors = extractedColors.value.filter(c => c.type === 'hex')
  if (hexColors.length) groups.push({ label: 'Hex 颜色', badgeClass: 'bg-pink-400', items: hexColors })

  const textColors = extractedColors.value.filter(c => c.tailwindCategory === 'text')
  if (textColors.length) groups.push({ label: '文字颜色 (text-)', badgeClass: 'bg-blue-400', items: textColors })

  const bgColors = extractedColors.value.filter(c => c.tailwindCategory === 'bg')
  if (bgColors.length) groups.push({ label: '背景颜色 (bg-)', badgeClass: 'bg-green-400', items: bgColors })

  const borderColors = extractedColors.value.filter(c => c.tailwindCategory === 'border')
  if (borderColors.length) groups.push({ label: '边框颜色 (border-)', badgeClass: 'bg-yellow-400', items: borderColors })

  const otherColors = extractedColors.value.filter(c => c.type === 'css-var' || c.tailwindCategory === 'other' || c.type === 'rgba')
  if (otherColors.length) groups.push({ label: '其他颜色', badgeClass: 'bg-gray-400', items: otherColors })

  return groups
})

function isHexColor(v: string) {
  return /^#[0-9a-fA-F]{3,8}$/.test(v)
}

function tailwindToHex(className: string): string {
  // 简化映射：常用的 Tailwind 颜色近似值
  const map: Record<string, string> = {
    'slate-500': '#64748b', 'gray-500': '#6b7280', 'blue-500': '#3b82f6',
    'red-500': '#ef4444', 'green-500': '#22c55e', 'yellow-500': '#eab308',
    'brand': '#2F6BFF', 'primary': '#2F6BFF',
  }
  for (const [key, val] of Object.entries(map)) {
    if (className.includes(key)) return val
  }
  return '#2F6BFF'
}

function onColorChange(item: ExtractedColor, newHex: string) {
  // 在代码编辑器中替换颜色
  codeEditorContent.value = codeEditorContent.value.replace(item.original, newHex)
  item.value = newHex
  item.original = newHex
  // 立即预览
  previewFromCode()
}

// ====== 事件绑定 ======
interface BindingItem {
  elementId: string
  elementTag: string
  event: string
  eventBusEventName: string
  selector: string
}

const bindings = ref<BindingItem[]>([])
const eventBusName = ref('$EventBus')
let bindingCounter = 0

// 选取器状态
const pickerActive = ref(false)
const pendingBinding = ref<{
  elementId: string
  tagName: string
  event: string
  selector: string
} | null>(null)

function startElementPicker() {
  pickerActive.value = true
  // 在沙箱预览区域启用 hover 高亮 + click 选中
  // 实际通过给 PreviewSandbox 容器添加事件监听
  nextTick(() => {
    const sandboxEl = document.querySelector('.preview-mount-root')
    if (!sandboxEl) return

    const select = (e: MouseEvent) => {
      if (!pickerActive.value) return
      e.preventDefault()
      e.stopPropagation()
      const target = (e.target as HTMLElement).closest('[data-element-id]') as HTMLElement | null
      if (!target || target === sandboxEl) return

      const elementId = target.dataset.elementId || ''
      pendingBinding.value = {
        elementId,
        tagName: target.tagName.toLowerCase(),
        event: 'click',
        selector: `[data-element-id="${elementId}"]`,
      }
      pickerActive.value = false
    }

    const onMove = (e: MouseEvent) => {
      if (!pickerActive.value) return
      const target = (e.target as HTMLElement).closest('[data-element-id]') as HTMLElement | null
      sandboxEl.querySelectorAll('.sb-picker-highlight').forEach(el => {
        (el as HTMLElement).style.outline = ''
      })
      if (target && target !== sandboxEl) {
        target.style.outline = '2px solid #FFD700'
        target.style.outlineOffset = '1px'
      }
    }

    sandboxEl.addEventListener('mousemove', onMove as EventListener)
    sandboxEl.addEventListener('click', select as EventListener)

    // 清理
    const cleanup = () => {
      sandboxEl.removeEventListener('mousemove', onMove as EventListener)
      sandboxEl.removeEventListener('click', select as EventListener)
      sandboxEl.querySelectorAll('.sb-picker-highlight').forEach(el => {
        (el as HTMLElement).style.outline = ''
      })
    }
    ;(window as any).__pickerCleanup = cleanup
  })
}

function confirmBinding() {
  if (!pendingBinding.value) return
  bindingCounter++
  bindings.value.push({
    elementId: pendingBinding.value.elementId,
    elementTag: pendingBinding.value.tagName,
    event: pendingBinding.value.event,
    eventBusEventName: eventBusName.value,
    selector: pendingBinding.value.selector,
  })
  pendingBinding.value = null
}

function cancelBinding() {
  pendingBinding.value = null
}

function restartPicker() {
  pendingBinding.value = null
  pickerActive.value = true
  startElementPicker()
}

function removeBinding(idx: number) {
  bindings.value.splice(idx, 1)
}

function editBindingEvent(idx: number) {
  const current = bindings.value[idx].event
  bindings.value[idx].event = current === 'click' ? 'dblclick' : 'click'
}

function highlightBinding(idx: number) {
  // 沙箱中高亮对应元素
}

function clearBindingHighlight(idx: number) {
  // 清除高亮
}

function removeI18nKey(idx: number) {
  const entry = i18nEntries.value[idx]
  if (!entry) return
  i18nEntries.value.splice(idx, 1)
  // 也从 codeEditor 中移除对应的 $t('key') 调用
  codeEditorContent.value = codeEditorContent.value.replace(
    new RegExp(`\\$t\\(\\s*['"]${entry.key}['"]\\s*\\)`, 'g'),
    `'${entry.key}'`
  )
}

// ====== 代码分析 ======
function analyzeCode(code: string) {
  // 提取 $t() keys
  i18nKeys.value = extractI18nKeys(code)

  // 同步 i18nEntries：保留已有翻译，新增缺失的 key
  const existingMap = new Map<string, Record<string, string>>()
  for (const entry of i18nEntries.value) {
    existingMap.set(entry.key, entry.values)
  }
  i18nEntries.value = i18nKeys.value.map(key => ({
    key,
    values: existingMap.get(key) || { zh: '', en: '', vn: '', th: '', ph: '' },
  }))

  // 提取颜色
  extractedColors.value = extractColors(code)
}

function onCodePaste() {
  nextTick(() => analyzeCode(codeEditorContent.value))
}

function onCodeChange() {
  // 用户打字时不自动分析，只在明确操作时分析
}

function reExtractI18n() {
  analyzeCode(codeEditorContent.value)
  activeEditorTab.value = 'i18n'
}

function reExtractColors() {
  analyzeCode(codeEditorContent.value)
  activeEditorTab.value = 'color'
}

// ====== 预览 ======
function previewFromCode() {
  const code = codeEditorContent.value
  if (!code.trim()) return

  // 解析 SFC
  const result = parseSFC(code)
  if (result && result.componentDef) {
    sandboxComponentDef.value = result.componentDef
    sandboxCss.value = result.css

    // 生成 mock 翻译
    const mockTrans: Record<string, string> = {}
    for (const entry of i18nEntries.value) {
      mockTrans[entry.key] = entry.values[editLang.value] || entry.key
    }
    sandboxTranslations.value = mockTrans

    // 自动选取
    activeEditorTab.value = 'code'
  }
}

// ====== 文件管理 ======
function loadFile(file: any) {
  activeFileId.value = file.id
  codeEditorContent.value = [
    file.template ? '<' + 'template>\n' + file.template + '\n</' + 'template>' : '',
    file.script ? '<' + 'script>\n' + file.script + '\n<' + '/script>' : '',
    file.style ? '<' + 'style scoped>\n' + file.style + '\n<' + '/style>' : '',
  ].filter(Boolean).join('\n\n')

  if (file.i18nEntries) {
    i18nEntries.value = JSON.parse(JSON.stringify(file.i18nEntries))
  }
  if (file.bindings) {
    bindings.value = JSON.parse(JSON.stringify(file.bindings))
  }
  if (file.colorVars) {
    extractedColors.value = JSON.parse(JSON.stringify(file.colorVars))
  }
  analyzeCode(codeEditorContent.value)
  previewFromCode()
}

function createNewFile() {
  const now = Date.now()
  const file = {
    id: `file_${now}`,
    name: `NewComponent_${now % 1000}`,
    description: '新建组件',
    version: '1.0.0',
    updatedAt: new Date().toISOString(),
    template: '',
    script: `export default {\n  name: 'NewComponent',\n  data() { return {} },\n  methods: {}\n}`,
    style: '',
    i18nEntries: [],
    bindings: [],
    colors: [],
    eventBusName: '$EventBus',
  }
  saveComponent(file)
  loadFile(file)
}

function saveFile() {
  if (!activeFileId.value) return

  // 重新分析代码
  analyzeCode(codeEditorContent.value)

  // 解析 SFC
  const result = parseSFC(codeEditorContent.value)

  const updated = {
    id: activeFileId.value,
    name: storeFiles.value.find(f => f.id === activeFileId.value)?.name || 'Unnamed',
    description: storeFiles.value.find(f => f.id === activeFileId.value)?.description || '',
    version: storeFiles.value.find(f => f.id === activeFileId.value)?.version || '1.0.0',
    updatedAt: new Date().toISOString(),
    template: result?.componentDef?.template || '',
    script: extractScript(codeEditorContent.value),
    style: result?.css || '',
    i18nEntries: JSON.parse(JSON.stringify(i18nEntries.value)),
    bindings: JSON.parse(JSON.stringify(bindings.value)),
    colors: JSON.parse(JSON.stringify(extractedColors.value)),
    eventBusName: eventBusName.value,
  }
  saveComponent(updated)
}

function deleteFile(id: string) {
  if (confirm('确定删除此组件？')) {
    removeComponent(id)
    if (activeFileId.value === id) {
      activeFileId.value = null
      codeEditorContent.value = ''
      sandboxComponentDef.value = null
      sandboxCss.value = ''
      i18nEntries.value = []
    }
  }
}

function extractScript(code: string): string {
  const match = code.match(new RegExp('<script[^>]*>([\\s\\S]*?)<\\/script>'))
  return match ? match[1].trim() : ''
}

// ====== 导出 ======
const showExportModal = ref(false)

const exportVueCode = computed(() => {
  const template = sandboxComponentDef.value?.template || ''
  const code = codeEditorContent.value
  const scriptRaw = extractScript(code)
  const styleRaw = sandboxCss.value

  // 生成事件绑定注入：mounted 中注册 EventBus
  let eventBusInjections = ''
  if (bindings.value.length > 0) {
    eventBusInjections = bindings.value
      .map(b => {
        const handlerName = `__eb_${b.event}_${b.elementId}`
        return `  ${handlerName}() {\n    ${eventBusName.value}.$emit('${b.elementTag}:${b.event}', {\n      elementId: '${b.elementId}',\n      event: '${b.event}',\n      timestamp: Date.now(),\n    })\n  }`
      })
      .join(',\n')

    // 构建 mounted 代码
    const mountBindings = bindings.value
      .map(b => `    const el = this.$el?.querySelector('[data-element-id="${b.elementId}"]'); if (el) el.addEventListener('${b.event}', this.__eb_${b.event}_${b.elementId})`)
      .join('\n')
    const beforeDestroyBindings = bindings.value
      .map(b => `    const el = this.$el?.querySelector('[data-element-id="${b.elementId}"]'); if (el) el.removeEventListener('${b.event}', this.__eb_${b.event}_${b.elementId})`)
      .join('\n')

    // 注入到 script 中
    let finalScript = scriptRaw
    if (finalScript.includes('mounted()')) {
      finalScript = finalScript.replace('mounted()', `mounted() {\n${mountBindings}\n`)
    } else if (finalScript.includes('mounted:')) {
      finalScript = finalScript.replace('mounted:', `mounted: function() {\n${mountBindings}\n  },`)
    }

    if (finalScript.includes('beforeDestroy()')) {
      finalScript = finalScript.replace('beforeDestroy()', `beforeDestroy() {\n${beforeDestroyBindings}\n`)
    } else {
      // 添加到 methods 后
      finalScript = finalScript.replace(/(\s*\})$/, `,\n  beforeDestroy() {\n${beforeDestroyBindings}\n  }\n$1`)
    }

    // 添加方法
    finalScript = finalScript.replace(/(\s*\})$/, `,\n${eventBusInjections}\n$1`)

    return '<' + 'template>\n' + template + '\n</' + 'template>\n\n<' + 'script>\n' + finalScript + '\n<' + '/script>\n\n<' + 'style scoped>\n' + styleRaw + '\n<' + '/style>'
  }

  return '<' + 'template>\n' + template + '\n</' + 'template>\n\n<' + 'script>\n' + scriptRaw + '\n<' + '/script>\n\n<' + 'style scoped>\n' + styleRaw + '\n<' + '/style>'
})

function copyExportCode() {
  navigator.clipboard.writeText(exportVueCode.value)
  alert('已复制到剪贴板')
}

function downloadExportFile() {
  const name = storeFiles.value.find(f => f.id === activeFileId.value)?.name || 'component'
  const blob = new Blob([exportVueCode.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.vue`
  a.click()
  URL.revokeObjectURL(url)
}

// ====== 辅助 ======
function fillAllLanguages() {
  // 预留：AI 一键翻译
  alert('AI 一键翻译功能对接中')
}
</script>