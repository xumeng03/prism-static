// 生成客户端唯一标识：时间戳 + 随机数，对上传队列条目 / Toast 等本地唯一场景已足够
export function uid(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
}