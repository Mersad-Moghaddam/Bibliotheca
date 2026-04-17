import {
  BookCheck,
  BookHeart,
  BookMarked,
  BookOpen,
  CircleUserRound,
  Compass,
  Library,
  Sparkles
} from 'lucide-react'

export const navigationLinks = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: Compass, section: 'core' },
  { to: '/coach', labelKey: 'nav.coach', icon: Sparkles, section: 'core' },
  { to: '/library', labelKey: 'nav.library', icon: Library, section: 'core' },
  { to: '/reading', labelKey: 'nav.reading', icon: BookOpen, section: 'flow' },
  { to: '/finished', labelKey: 'nav.finished', icon: BookCheck, section: 'flow' },
  { to: '/next', labelKey: 'nav.nextToRead', icon: BookMarked, section: 'flow' },
  { to: '/wishlist', labelKey: 'nav.wishlist', icon: BookHeart, section: 'flow' },
  { to: '/profile', labelKey: 'nav.profile', icon: CircleUserRound, section: 'account' }
] as const

export const navigationGroups = [
  { key: 'core', titleKey: 'nav.workspace' },
  { key: 'flow', titleKey: 'nav.readingFlow' },
  { key: 'account', titleKey: 'nav.account' }
] as const
