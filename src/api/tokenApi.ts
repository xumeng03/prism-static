// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, post, type ApiResponse} from '@/utils/http'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {TokenScope, TokenData, CreateTokenResult} from '@/types/token'

// 后端返回的 token 权限位 → 前端 scopes 数组
export function scopesFromToken(t: TokenData): TokenScope[] {
    const s: TokenScope[] = []
    if (t.can_read) s.push('read')
    if (t.can_write) s.push('write')
    if (t.can_delete) s.push('delete')
    return s
}

export function listTokens(): Promise<ApiResponse<TokenData[]>> {
    return get<ApiResponse<TokenData[]>>('/token')
}

export function createToken(data: {
    name: string
    can_read: boolean
    can_write: boolean
    can_delete: boolean
}): Promise<ApiResponse<CreateTokenResult>> {
    return post<ApiResponse<CreateTokenResult>>('/token/create', data)
}

export function revokeToken(id: number): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/token/revoke', {id})
}
