// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {TokenScope} from '@/types/token'

// API Token 权限项的完整描述结构，用于权限选择 UI 和权限说明文案
export interface ScopeItem {
    // 权限键名，与后端 Token scope 字段一一对应，受 TokenScope 联合类型约束
    key: TokenScope
    // 英文简称，用于标签、徽章等空间有限的位置
    label: string
    // 中文短描述，显示在权限勾选项旁（如"读取图片"）
    shortZh: string
    // 英文短描述
    shortEn: string
    // 中文详细说明，显示在展开的权限详情区域
    descZh: string
    // 英文详细说明
    descEn: string
    // 该权限允许的 HTTP 方法，展示给开发者了解调用方式（如 'GET'、'POST / PATCH'）
    method: string
}

// 系统支持的全部 API 权限列表，按"读 → 写 → 删"递进顺序排列
// delete 单独列出并标注"不可撤销"，提示用户谨慎授予
export const SCOPES: ScopeItem[] = [
    {key: 'read',   label: 'Read',   shortZh: '读取图片', shortEn: 'Read images',   descZh: '读取图片详情与元数据',   descEn: 'Read image details and metadata', method: 'GET'},
    {key: 'write',  label: 'Write',  shortZh: '上传图片', shortEn: 'Upload',        descZh: '上传与更新图片',         descEn: 'Upload and update images',        method: 'POST / PATCH'},
    {key: 'delete', label: 'Delete', shortZh: '删除图片', shortEn: 'Delete',        descZh: '删除图片，操作不可撤销', descEn: 'Delete images - irreversible',    method: 'DELETE'},
]
