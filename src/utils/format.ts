import type {NotificationGroup} from '@/types/notification'

// 将 Date 对象格式化为 "yyyy-mm-dd" 字符串（用于 API 提交和列表展示）
export function formatDate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth() 从0开始，需+1
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

// 数字缩写显示：1234 → "1.2k"，12345 → "12k"
export function formatNumber(value: number) {
    return value >= 1000 ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k` : String(value)
}

// 将后端返回的 "yyyy-mm-dd hh:mm:ss" 转为人类可读的相对时间；超过一天显示原始日期
// 返回 [zh, en] 元组，供 t() 直接展开使用
export function formatRelativeTime(datetime: string): [string, string] {
    // .replace(' ', 'T')：ISO 8601 要求用 'T' 分隔，部分环境不接受空格
    const date = new Date(datetime.replace(' ', 'T'))
    const diffMin = Math.floor((Date.now() - date.getTime()) / 60_000)
    const diffHour = Math.floor(diffMin / 60)
    if (diffMin < 1) return ['刚刚', 'just now']
    if (diffMin < 60) return [`${diffMin} 分钟前`, `${diffMin} min ago`]
    if (diffHour < 24) return [`${diffHour} 小时前`, `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`]
    // 超过一天直接展示日期（截取 yyyy-mm-dd），中英文格式相同，无需分别处理
    const dateStr = datetime.slice(0, 10)
    return [dateStr, dateStr]
}

// 根据时间距今的天数推算通知所属分组
export function groupOf(time: string): NotificationGroup {
    const diffDays = (Date.now() - new Date(time.replace(' ', 'T')).getTime()) / 86_400_000
    if (diffDays < 1) return 'today'
    if (diffDays < 7) return 'week'
    if (diffDays < 30) return 'month'
    return 'earlier'
}

// 字节数转可读字符串：1_572_864 → "1.5 MB"，491_520 → "480 KB"
export function formatSize(bytes: number) {
    if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(1)} GB`
    if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
    return `${Math.round(bytes / 1024)} KB`
}

// 将 "YYYY-MM" 键格式化为本地化月份标题，如 "2026年 6月" / "June 2026"
// t 以参数传入而非在函数内调用 hook，使工具函数保持无 React 依赖，可在任意上下文使用
export function formatMonth(key: string, t: (zh: string, en: string) => string) {
    if (key === 'unknown') {
        return t('未知时间', 'Unknown')
    }
    const [year, month] = key.split('-')
    const d = new Date(Number(year), Number(month) - 1)
    const en = d.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})
    return t(`${year}年${Number(month)}月`, en)
}