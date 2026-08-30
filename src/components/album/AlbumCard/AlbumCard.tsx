// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {Icon} from '@/components/common/icon/Icon'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {Album} from '@/types/album'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AlbumCard.css'

interface AlbumCardProps {
    // 要展示的相册数据
    album: Album
    // 点击卡片时的回调，父组件负责跳转到相册详情
    onOpen: (album: Album) => void
    // 重命名按钮回调
    onRename: (album: Album) => void
    // 删除按钮回调
    onDelete: (album: Album) => void
}

export function AlbumCard({album, onOpen, onRename, onDelete}: AlbumCardProps) {
    // t('中文', 'English') — 根据当前语言环境自动返回对应文本
    const t = useTranslation()

    return (
        <div className="album-card" onClick={() => onOpen(album)}>
            <div className="album-cover">
                {/* 最多取前 3 张封面图拼贴，不足时用占位图填充 */}
                {Array.from({length: 3}).map((_, i) => {
                    const cover = album.covers[i]
                    return cover ? (
                        <div className="c" key={cover}>
                            <img src={cover} alt=""/>
                        </div>
                    ) : (
                        <div className="c album-cover-empty" key={`empty-${i}`}>
                            <Icon name="image" size={28}/>
                        </div>
                    )
                })}
                <span className="album-count"><Icon name="image"/> {album.count}</span>
                <div className="album-actions">
                    <button className="album-act-btn" type="button" onClick={(e) => {
                        e.stopPropagation();
                        onRename(album)
                    }} title={t('重命名', 'Rename')}>
                        <Icon name="settings" size={15} weight={2.4}/>
                    </button>
                    <button className="album-act-btn danger" type="button" onClick={(e) => {
                        e.stopPropagation();
                        onDelete(album)
                    }} title={t('删除', 'Delete')}>
                        <Icon name="trash" size={15} weight={2.4}/>
                    </button>
                </div>
            </div>
            <div className="album-meta">
                <div className="album-name">{album.name}</div>
                <div className="album-sub">{album.description ? album.description : t(`最后更新于 ${album.date}`, `last updated on ${album.date}`)}</div>
            </div>
        </div>
    )
}
