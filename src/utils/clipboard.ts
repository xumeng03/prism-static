// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useI18nStore} from '@/store/i18nStore'
import {toast} from '@/store/toastStore'

// 模块级翻译函数：非组件环境无法调用 useTranslation Hook，直接读 i18n store 取 UI 语言
const t = (zh: string, en: string) => useI18nStore.getState().language === 'zh-CN' ? zh : en

// 封装剪贴板写入操作：复制成功后自动弹 toast 通知，调用方无需重复处理反馈逻辑
export async function clipboard(text: string) {
    // navigator.clipboard 是浏览器原生 Clipboard API，需在 HTTPS 或 localhost 下才可用
    await navigator.clipboard.writeText(text)
    toast.success(t('已复制到剪贴板', 'Copied to clipboard'))
}