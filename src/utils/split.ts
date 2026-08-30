// 取 date 字符串的前 7 位（YYYY-MM）作为分组键，date 为空时归入 unknown 组
export function splitMonth(date: string) {
    return (date || '').slice(0, 7) || 'unknown'
}