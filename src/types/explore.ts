// 支持上传和展示的图片格式
export type ImageFileType = 'jpg' | 'png' | 'gif' | 'webp'

// 首页瀑布流的分类筛选项
export type FeedCategory = 'trending' | 'newest' | 'portrait' | 'landscape' | 'street' | 'arch' | 'abstract' | 'animals'

// 图库中单张图片的完整数据结构
export interface GalleryItem {
    id: number
    title: string
    type: ImageFileType
    size: number            // 字节数，展示时调用 fmtSize() 转换为可读字符串
    url: string             // thumbnail_key → CDN URL，用于列表/卡片缩略图
    originalUrl: string     // original_key → CDN URL，用于详情页展示原图
    hash: string            // 文件内容哈希，用于服务端去重校验
    width: number           // 图片宽度（像素）
    height: number          // 图片高度（像素）
    aspect: number          // 宽高比（宽/高），用于计算卡片 aspectRatio，如 1.5 表示 3:2
    category: FeedCategory
    view: number            // 浏览次数
    like: number            // 收藏/点赞数
    copy: number            // 链接复制次数
    download: number        // 下载次数
    date: string            // 上传日期，格式 "yyyy-mm-dd hh:mm:ss"
    author: string          // 上传者昵称
    avatar?: string         // 作者头像 CDN URL，有则展示图片，无则用 avaGrad 渐变色 + 首字母兜底
    avaGrad: string         // 作者头像的个性化渐变色，由后端生成，全局唯一
    album: string           // 所属相册名称
}

// 单次分页结果：items 是本页图片，hasMore 告知是否还有下一页（控制无限滚动的哨兵行为）
export interface ExploreResult {
    items: GalleryItem[]
    total: number
    hasMore: boolean
}

// 平台统计数字；字段类型为 string 而非 number——后端已预先格式化（如 "1.2M"），前端直接展示
export interface ExploreStats {
    images_hosted: string
    edge_nodes: string
    total_views: string
}
