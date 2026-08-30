// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useState} from 'react'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './ProgressiveImage.css'

interface ProgressiveImageProps {
    // 缩略图地址：先渲染并决定容器尺寸，原图未加载完前作为占位
    src: string
    // 原图地址：可选，传入后加载完成时以 opacity 淡入覆盖缩略图
    original?: string
    // 原图的 alt 文本；缩略图固定 alt=""（装饰性，避免读屏重复朗读）
    alt?: string
    // 应用于两张图片的类名，由调用方控制尺寸/圆角等外观（如 .ei-img / .idm-image）
    className?: string
}

interface OriginalOverlayProps {
    original: string
    alt?: string
    className?: string
}

// 原图覆盖层单独成组件：key 绑定原图地址，地址变化时 React 重挂载、内部 loaded 自动复位，
// 从而免去父组件手动重置状态（也规避了 effect 内同步 setState 的 lint 约束）
function OriginalOverlay({original, alt, className}: OriginalOverlayProps) {
    // 原图是否加载完成；onLoad 触发后附加 .loaded 类，CSS 过渡完成淡入
    const [loaded, setLoaded] = useState(false)

    return (
        <img
            alt={alt}
            className={`${className ?? ''} pi-orig${loaded ? ' loaded' : ''}`}
            src={original}
            onLoad={() => setLoaded(true)}
        />
    )
}

// 渐进式图片加载：缩略图先占位，原图 onLoad 后淡入覆盖，避免大图直接加载的空白闪烁
export function ProgressiveImage({src, original, alt, className}: ProgressiveImageProps) {
    return (
        <>
            <img alt="" className={className} src={src}/>
            {original && <OriginalOverlay key={original} original={original} alt={alt} className={className}/>}
        </>
    )
}
