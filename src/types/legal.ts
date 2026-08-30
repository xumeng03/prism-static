// 法律文档标识：对应 /legal/:doc 路由的四个文档
export type LegalDoc = 'terms' | 'privacy' | 'guidelines' | 'dmca'

// 单个章节：id 用于锚点跳转；heading 与 body 均为 [中文, English] 双语元组
export interface LegalSection {
    id: string
    heading: [string, string]
    body: [string, string][]
}

// 单份法律文档的完整内容：标题、更新日期与章节列表
export interface LegalContent {
    title: [string, string]
    updated: [string, string]
    sections: LegalSection[]
}