// ─── React 核心 ───────────────────────────────────────────────────────────────
import {useEffect, useState} from 'react'

// ─── 第三方：路由 ─────────────────────────────────────────────────────────────
import {useNavigate} from 'react-router-dom'

// ─── API ──────────────────────────────────────────────────────────────────────
import {listAlbums, createAlbum, updateAlbum, deleteAlbum} from '@/api/albumApi'

// ─── 内部组件 ─────────────────────────────────────────────────────────────────
import {AlbumCard} from '@/components/album/AlbumCard/AlbumCard'
import {Icon} from '@/components/common/icon/Icon'
import {Modal} from '@/components/common/modal/Modal'

// ─── Hooks ────────────────────────────────────────────────────────────────────
import {useTranslation} from '@/hooks/useTranslation'  // 返回 (zh, en) => string 函数

// ─── 状态管理 ─────────────────────────────────────────────────────────────────
import {toast} from '@/store/toastStore'

// ─── 类型 ─────────────────────────────────────────────────────────────────────
import type {Album} from '@/types/album'  // type-only import，编译后完全擦除

// ─── 页内组件 ─────────────────────────────────────────────────────────────────
import {NewAlbumDialog} from './NewAlbumDialog'  // 新建相册的表单弹窗，与本页同目录

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './AlbumPage.css'

export default function AlbumPage() {
    const t = useTranslation()
    // nav('/path') — 不刷新页面地切换到目标路由
    const nav = useNavigate()
    // 相册列表；初始空数组，等待 useEffect 中的 API 响应填充
    const [albums, setAlbums] = useState<Album[]>([])
    // 新建相册弹窗开关；初始 false，点击"新建相册"卡片后置 true
    const [showNewAlbum, setShowNewAlbum] = useState(false)
    // 编辑模式：当前正在重命名的相册对象；null 表示未在编辑
    const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
    // 删除确认：当前等待确认删除的相册对象；null 表示未在确认
    const [deletingAlbum, setDeletingAlbum] = useState<Album | null>(null)
    // 删除中的 loading 状态，防止重复提交
    const [deleting, setDeleting] = useState(false)

    // 触发时机：组件挂载时拉取一次相册列表，空依赖数组确保不重复请求
    useEffect(() => {
        listAlbums().then((res) => setAlbums(res.data))
    }, [])

    const openAlbum = (album: Album) => {
        // 将完整 album 对象写入路由状态：详情页直接读取，无需再发一次请求
        nav(`/album/${album.id}`, {state: {album}})
    }

    // 调相册变更接口后统一刷新列表并提示结果；addAlbum / handleEditAlbum 复用，避免重复的 .then 链
    const refreshAlbums = (request: Promise<unknown>, successMsg: string, errorMsg: string) => {
        request
            // 变更成功后重新拉取列表，以服务端数据为准，确保 id / 封面等字段与后端一致
            .then(() => listAlbums())
            .then((res) => {
                setAlbums(res.data)
                toast.success(successMsg)
            })
            .catch(() => toast.error(errorMsg))
    }

    const addAlbum = (name: string, description: string) => {
        refreshAlbums(
            createAlbum(name, description),
            t('相册已创建', 'Album created'),
            t('创建失败', 'Failed to create album'),
        )
    }

    const handleEditAlbum = (name: string, description: string) => {
        if (!editingAlbum) return
        refreshAlbums(
            updateAlbum(editingAlbum.id, name, description),
            t('相册已更新', 'Album updated'),
            t('更新失败', 'Failed to update album'),
        )
        setEditingAlbum(null)
    }

    const handleDeleteAlbum = async () => {
        if (!deletingAlbum) return
        setDeleting(true)
        try {
            const res = await deleteAlbum(deletingAlbum.id)
            if (res.code === 200) {
                setAlbums((prev) => prev.filter((a) => a.id !== deletingAlbum.id))
                toast.success(t(`已删除「${deletingAlbum.name}」`, `Deleted "${deletingAlbum.name}"`))
            } else {
                toast.error(t('删除失败', 'Delete failed'))
            }
        } catch {
            toast.error(t('删除失败', 'Delete failed'))
        }
        setDeleting(false)
        setDeletingAlbum(null)
    }

    return (
        <section className="albums-page">
            {/* ─── 页面标题 ──────────────────────────────────────────────────── */}
            <div className="sec-head">
                <div>
                    <h2>{t('相册', 'Albums')}</h2>
                    <p>{t('把图片整理成相册，便于分享与管理', 'Organise images into albums for easy sharing')}</p>
                </div>
            </div>

            {/* ─── 相册网格 ──────────────────────────────────────────────────── */}
            <div className="album-grid">
                {albums.map((album) => (
                    <AlbumCard
                        key={album.id}
                        album={album}
                        onOpen={openAlbum}
                        onRename={setEditingAlbum}
                        onDelete={setDeletingAlbum}
                    />
                ))}
                {/* "新建相册"卡片固定排在网格末尾，点击打开创建弹窗 */}
                <div className="album-card album-new" onClick={() => setShowNewAlbum(true)}>
                    <div className="ic">
                        <Icon name="plus"/>
                    </div>
                    <b>{t('新建相册', 'New album')}</b>
                    <span>{t('创建一个新相册', 'Create an album')}</span>
                </div>
            </div>

            {/* ─── 新建相册弹窗：showNewAlbum 为 true 时挂载 ─────────────────── */}
            {/* t 以 prop 传入而非在弹窗内部调用 hook，避免弹窗组件额外依赖 hook 层 */}
            {showNewAlbum &&
                <NewAlbumDialog onConfirm={addAlbum}
                                onClose={() => setShowNewAlbum(false)}/>
            }

            {/* ─── 重命名相册弹窗 ──────────────────────────────────────────── */}
            {editingAlbum &&
                <NewAlbumDialog mode="edit"
                                initialName={editingAlbum.name}
                                initialDescription={editingAlbum.description ?? ''}
                                onConfirm={handleEditAlbum}
                                onClose={() => setEditingAlbum(null)}/>
            }

            {/* ─── 删除相册确认弹窗 ────────────────────────────────────────── */}
            {deletingAlbum &&
                <Modal
                    size="sm"
                    onClose={() => setDeletingAlbum(null)}
                    onConfirm={handleDeleteAlbum}
                    cancelText={t('取消', 'Cancel')}
                    confirmText={deleting ? t('删除中...', 'Deleting...') : t('确认删除', 'Delete')}
                    confirmVariant="danger"
                >
                    <div className="confirm-body">
                        <div className="confirm-ic"><Icon name="trash"/></div>
                        <b>{t('删除这个相册？', 'Delete this album?')}</b>
                        <p>{t('此操作无法撤销，相册内的图片不会被删除。', 'This cannot be undone. Images in the album will not be deleted.')}</p>
                    </div>
                </Modal>
            }
        </section>
    )
}