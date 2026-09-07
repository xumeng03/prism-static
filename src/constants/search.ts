// SearchPage 相关的静态元数据
// 名称加 SEARCH_ 前缀避免与其它模块可能存在的 "page size" / "suggestions" 常量冲突

// 单次拉取的图片数量：搜索为客户端过滤，一次取回更多数据避免分页请求
export const SEARCH_PAGE_SIZE = 100

// 搜索建议按钮：q 是实际写入搜索框的英文关键词；zh/en 是按钮显示的本地化标签
export const SEARCH_SUGGESTIONS: { zh: string; en: string; q: string }[] = [
    {zh: '壁纸', en: 'wallpaper', q: 'wallpaper'},
    {zh: '渐变', en: 'gradient', q: 'gradient'},
    {zh: '城市', en: 'city', q: 'city'},
    {zh: 'UI', en: 'UI', q: 'ui'},
    {zh: '摄影', en: 'portrait', q: 'portrait'},
    {zh: '抽象', en: 'abstract', q: 'abstract'},
]