// API 文档页请求参数行
export interface ApiParam {
    name: string            // 参数名
    type: string            // 参数类型（file / int / string / json[] / path / int | null 等）
    required?: boolean      // 未传时视为可选（undefined 与 false 等价）
    descZh: string          // 中文说明
    descEn: string          // 英文说明
}

// API 文档页单个端点
export interface ApiEndpoint {
    key: string             // 唯一标识，用于展开/折叠状态
    method: string          // HTTP 方法（GET / POST / PATCH / DELETE）
    path: string            // 端点路径，如 /v1/upload
    descZh: string          // 中文简介
    descEn: string          // 英文简介
    noteZh: string          // 中文补充说明
    noteEn: string          // 英文补充说明
    params: ApiParam[]      // 请求参数列表
    sample: string          // cURL 示例代码
}