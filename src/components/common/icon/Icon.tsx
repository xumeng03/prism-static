// ─── React 类型 ───────────────────────────────────────────────────────────────
import type {FunctionComponent, SVGProps} from 'react'

// ─── 图标资源（SVG → React 组件）────────────────────────────────────────────
// ?react 是 vite-plugin-svgr 的查询后缀
// 不加后缀时 Vite 把 SVG 当静态资源，返回 URL 字符串；加上 ?react 后插件将其编译成 React 组件
// 这样可以直接用 JSX 渲染，并通过 props（如 style）动态控制颜色和尺寸，无需 <img src>
// ── 品牌 / 导航 ──
import PrismIcon from '@/assets/icons/prism.svg?react'
import CompassIcon from '@/assets/icons/compass.svg?react'
import GlobeIcon from '@/assets/icons/globe.svg?react'
// ── 搜索 / 通用操作 ──
import SearchIcon from '@/assets/icons/search.svg?react'
import UploadIcon from '@/assets/icons/upload.svg?react'
import DownloadIcon from '@/assets/icons/download.svg?react'
import CopyIcon from '@/assets/icons/copy.svg?react'
import TrashIcon from '@/assets/icons/trash.svg?react'
import PlusIcon from '@/assets/icons/plus.svg?react'
import CloseIcon from '@/assets/icons/close.svg?react'
import XIcon from '@/assets/icons/x.svg?react'
import LinkIcon from '@/assets/icons/link.svg?react'
import CheckIcon from '@/assets/icons/check.svg?react'
// ── 主题 / 布局切换 ──
import MoonIcon from '@/assets/icons/moon.svg?react'
import SunIcon from '@/assets/icons/sun.svg?react'
import GridIcon from '@/assets/icons/grid.svg?react'
import ListIcon from '@/assets/icons/list.svg?react'
// ── 方向箭头 ──
import ChevRIcon from '@/assets/icons/chevR.svg?react'
import ChevLIcon from '@/assets/icons/chevL.svg?react'
import ChevDownIcon from '@/assets/icons/chevDown.svg?react'
// ── 媒体 / 创作内容 ──
import ImageIcon from '@/assets/icons/image.svg?react'
import ImagesIcon from '@/assets/icons/images.svg?react'
import CameraIcon from '@/assets/icons/camera.svg?react'
import FilmIcon from '@/assets/icons/film.svg?react'
import PaintIcon from '@/assets/icons/paint.svg?react'
import AlbumIcon from '@/assets/icons/album.svg?react'
import SparkleIcon from '@/assets/icons/sparkle.svg?react'
import MountainIcon from '@/assets/icons/mountain.svg?react'
// ── 社交平台 ──
import GithubIcon from '@/assets/icons/github.svg?react'
import DiscordIcon from '@/assets/icons/discord.svg?react'
import GoogleIcon from '@/assets/icons/google.svg?react'
// ── 用户 / 认证 / 账户 ──
import UserIcon from '@/assets/icons/user.svg?react'
import LockIcon from '@/assets/icons/lock.svg?react'
import EyeOpenIcon from '@/assets/icons/eye-open.svg?react'
import EyeCloseIcon from '@/assets/icons/eye-close.svg?react'
import KeyIcon from '@/assets/icons/key.svg?react'
import ShieldIcon from '@/assets/icons/shield.svg?react'
import LogoutIcon from '@/assets/icons/logout.svg?react'
import MailIcon from '@/assets/icons/mail.svg?react'
import PhoneIcon from '@/assets/icons/phone.svg?react'
import SettingsIcon from '@/assets/icons/settings.svg?react'
import LaptopIcon from '@/assets/icons/laptop.svg?react'
import BuildingIcon from '@/assets/icons/building.svg?react'
// ── 状态 / 反馈 ──
import BellIcon from '@/assets/icons/bell.svg?react'
import CloudIcon from '@/assets/icons/cloud.svg?react'
import FlameIcon from '@/assets/icons/flame.svg?react'
import HeartIcon from '@/assets/icons/heart.svg?react'
import HeartFilledIcon from '@/assets/icons/heart-filled.svg?react'
import InfoIcon from '@/assets/icons/info.svg?react'
import ApiIcon from '@/assets/icons/api.svg?react'
import PawIcon from '@/assets/icons/paw.svg?react'

// ─── 样式 ─────────────────────────────────────────────────────────────────────
import './Icon.css'

// SVG React 组件的通用类型简写
// FunctionComponent<SVGProps<SVGSVGElement>> 是 vite-plugin-svgr 生成的标准签名
// 起别名是为了让 ICONS 表的类型注解更简洁，不必每处都写完整泛型
type SvgIcon = FunctionComponent<SVGProps<SVGSVGElement>>

// 合法图标名的联合类型；调用方传错名称会在 TypeScript 编译时报错，而非运行时渲染空白
// 新增图标时需同步在此处追加，保持与 ICONS 表一致
export type IconName =
    | 'prism' | 'compass' | 'globe' | 'search' | 'upload' | 'download'
    | 'copy' | 'trash' | 'plus' | 'close' | 'x' | 'link' | 'check'
    | 'moon' | 'sun' | 'grid' | 'list'
    | 'chevR' | 'chevL' | 'chevDown'
    | 'image' | 'images' | 'camera' | 'film' | 'paint' | 'album' | 'sparkle' | 'mountain'
    | 'github' | 'discord' | 'google'
    | 'user' | 'lock' | 'eye-open' | 'eye-close' | 'key' | 'shield' | 'logout'
    | 'mail' | 'phone' | 'settings' | 'laptop' | 'building'
    | 'bell' | 'cloud' | 'flame' | 'heart' | 'heartFilled' | 'info' | 'api' | 'paw'

// 名称 → 组件的查找表，O(1) 按 name 取到对应 SVG 组件
// 用对象字面量而非 switch/if-else：结构更清晰，新增图标只需加一行键值对
// Record<IconName, SvgIcon> 强制要求 ICONS 覆盖所有 IconName，漏写会报编译错误
const ICONS: Record<IconName, SvgIcon> = {
    prism: PrismIcon, compass: CompassIcon, globe: GlobeIcon,
    search: SearchIcon, upload: UploadIcon, download: DownloadIcon,
    copy: CopyIcon, trash: TrashIcon, plus: PlusIcon, close: CloseIcon, x: XIcon,
    link: LinkIcon, check: CheckIcon,
    moon: MoonIcon, sun: SunIcon, grid: GridIcon, list: ListIcon,
    chevR: ChevRIcon, chevL: ChevLIcon, chevDown: ChevDownIcon,
    image: ImageIcon, images: ImagesIcon, camera: CameraIcon, film: FilmIcon,
    paint: PaintIcon, album: AlbumIcon, sparkle: SparkleIcon, mountain: MountainIcon,
    github: GithubIcon, discord: DiscordIcon, google: GoogleIcon,
    user: UserIcon, lock: LockIcon, 'eye-open': EyeOpenIcon, 'eye-close': EyeCloseIcon, key: KeyIcon,
    shield: ShieldIcon, logout: LogoutIcon, mail: MailIcon, phone: PhoneIcon,
    settings: SettingsIcon, laptop: LaptopIcon, building: BuildingIcon,
    bell: BellIcon, cloud: CloudIcon, flame: FlameIcon, heart: HeartIcon,
    heartFilled: HeartFilledIcon, info: InfoIcon, api: ApiIcon, paw: PawIcon,
}

interface IconProps {
    // 图标名称，受 IconName 联合类型约束，拼错会报编译错误
    name: IconName
    // 图标的宽高（像素），宽高相同保持正方形；不传时默认 18px 与正文行高视觉对齐
    size?: number
    // 图标颜色；默认 'inherit' 使图标自动继承父元素的文字颜色，无需每次手动指定
    color?: string
    // SVG stroke 线宽，控制图标的视觉粗细；默认 1.8 在小尺寸下清晰可辨
    weight?: number
}

export function Icon({name, size = 18, color = 'inherit', weight = 1.8}: IconProps) {
    // 从查找表取出对应的 SVG 组件，名称已被 IconName 约束，此处不会取到 undefined
    const Component = ICONS[name]
    // aria-hidden="true"：图标通常是装饰性的，对屏幕阅读器隐藏，避免读出无意义的 SVG 内容
    // strokeWidth 通过 style 而非 className 传递，因为它是运行时动态值，无法预先写在 CSS 里
    return <Component aria-hidden="true" style={{color, width: size, height: size, strokeWidth: weight}}/>
}
