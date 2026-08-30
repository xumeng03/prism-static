// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {DeviceItem, UploadAvatarResult} from '@/types/account'

// ─── 工具函数 / 类型 ─────────────────────────────────────────────────────────
import {get, post, upload, type ApiResponse} from '@/utils/http'

// 更新当前用户的公开资料（昵称、简介、地区）；字段为空时后端忽略
export function updateProfile(data: {
    nickname?: string
    bio?: string
    location?: string
}): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/account/profile', data)
}

// 修改密码；后端校验旧密码后才更新
export function updatePassword(data: {
    old_password: string
    new_password: string
}): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/account/password', data)
}

// 获取当前用户的登录设备列表
export function listDevices(): Promise<ApiResponse<DeviceItem[]>> {
    return get<ApiResponse<DeviceItem[]>>('/account/devices')
}

// 退出指定设备的登录会话
export function revokeDevice(sessionId: string): Promise<ApiResponse<null>> {
    return post<ApiResponse<null>>('/account/device/revoke', {session_id: sessionId})
}

// 上传头像：POST /account/avatar (multipart)
export function uploadAvatar(file: File): Promise<ApiResponse<UploadAvatarResult>> {
    const form = new FormData()
    form.append('file', file)
    return upload<ApiResponse<UploadAvatarResult>>('/account/avatar', form)
}