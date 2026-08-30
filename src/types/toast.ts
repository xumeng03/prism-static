// Toast 的视觉类型：success（绿色勾）/ error（红色叉）/ info（蓝色信息）
// 联合类型约束合法值，传入其他字符串会在编译时报错
export type ToastKind = 'success' | 'error' | 'info'

// 调用 toast 队列时传入的数据结构；kind 可选，不传默认 success
// 定义在 types 而非组件内，供 useToastStore 与各类调用方共用
export interface ToastPayload {
    message: string
    kind?: ToastKind
}