import type {GalleryItem} from './explore'

// 相册摘要（列表页使用，不包含图片详情）
export interface Album {
    id: number
    name: string
    description?: string     // 相册描述，可选
    count: number
    covers: string[]        // 缩略图 URL 数组，取前 3 张拼接封面预览网格
    date: string            // 最近更新时间
}

// 相册图片列表的分页响应结构
export interface AlbumImagesResult {
    list: GalleryItem[]
    total: number
    page: number
    page_size: number
    has_more: boolean
}
