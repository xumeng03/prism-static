// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {useI18nStore} from '@/store/i18nStore'
import {toast} from '@/store/toastStore'

// ─── API ──────────────────────────────────────────────────────────────────────
import {getDownloadUrl} from '@/api/libraryApi'

// 模块级翻译函数：非组件环境无法调用 useTranslation Hook，直接读 i18n store 取 UI 语言
const t = (zh: string, en: string) => useI18nStore.getState().language === 'zh-CN' ? zh : en

// 触发浏览器下载：拿到下载地址后创建临时 <a> 元素模拟点击，避免 window.open 被弹窗拦截
export async function downloadImage(id: number) {
    const res = await getDownloadUrl(id)
    if (res.code !== 200 || !res.data.url) {
        toast.error(t('获取下载链接失败', 'Failed to get download link'))
        return
    }
    const a = document.createElement('a')
    a.href = res.data.url
    a.download = '' // 空字符串表示使用服务器返回的文件名
    a.click()
}
