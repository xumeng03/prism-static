// 文件类型筛选的下拉选项，'all' 放在第一位作为默认选项
// value 用 jpeg 而非 jpg：后端 MIME 类型为 image/jpeg，'jpeg' 可直接作为子串模糊匹配
export const TYPE_OPTIONS: {value: string; zh: string; en: string}[] = [
    {value: 'all',  zh: '全部类型', en: 'All types'},
    {value: 'jpeg', zh: 'JPEG',     en: 'JPEG'},
    {value: 'png',  zh: 'PNG',      en: 'PNG'},
    {value: 'gif',  zh: 'GIF',      en: 'GIF'},
    {value: 'webp', zh: 'WEBP',     en: 'WEBP'},
]

// 排序方式的下拉选项，按使用频率降序排列（最新/最早用得最多，名称/大小次之）
export const SORT_OPTIONS: {value: string; zh: string; en: string}[] = [
    {value: 'newest', zh: '最新上传', en: 'Newest'},
    {value: 'oldest', zh: '最早上传', en: 'Oldest'},
    {value: 'name',   zh: '名称 A-Z', en: 'Name A-Z'},
    {value: 'size',   zh: '文件大小', en: 'Largest first'},
]
