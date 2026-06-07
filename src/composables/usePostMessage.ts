// 主平台通讯工具
// 通过 postMessage 与嵌入的主平台通信

export interface PlatformMessage {
  type: 'save' | 'load' | 'update'
  payload: Record<string, unknown>
}

/**
 * 向主平台发送消息
 */
export function sendToPlatform(type: string, payload: Record<string, unknown>) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type, payload }, '*')
  }
}

/**
 * 监听主平台消息
 */
export function onPlatformMessage(handler: (msg: PlatformMessage) => void) {
  const listener = (event: MessageEvent) => {
    // 可在此处校验 event.origin
    if (event.data && event.data.type) {
      handler(event.data as PlatformMessage)
    }
  }
  window.addEventListener('message', listener)
  return () => window.removeEventListener('message', listener)
}