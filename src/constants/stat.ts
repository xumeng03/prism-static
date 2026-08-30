// 首页统计数据项的结构，key 与后端接口返回的字段名保持一致
// 联合类型约束 key，避免拼错字段名后运行时静默返回 undefined
export type StatItem = {
    // 与接口响应字段对应的键名，用于从数据对象中取值
    key: 'images_hosted' | 'edge_nodes' | 'total_views'
    // 英文展示文案
    en: string
    // 中文展示文案
    zh: string
}

// 首页英雄区展示的三个平台统计指标，顺序即 UI 排列顺序
export const STATS: StatItem[] = [
    {key: 'images_hosted', zh: '已托管图片', en: 'Images hosted'},
    {key: 'edge_nodes',    zh: '全球边缘节点', en: 'Edge nodes'},
    {key: 'total_views',   zh: '外链访问量', en: 'Total views'},
]
