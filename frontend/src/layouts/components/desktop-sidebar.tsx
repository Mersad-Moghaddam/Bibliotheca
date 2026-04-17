import { BrandBlock } from './brand-block'
import { LayoutControls } from './layout-controls'
import { NavigationSection } from './navigation-section'

export function DesktopSidebar() {
  return (
    <aside className="surface hidden p-3.5 lg:sticky lg:top-5 lg:flex lg:h-[calc(100vh-2.5rem)] lg:flex-col lg:overflow-hidden lg:p-4">
      <BrandBlock />
      <NavigationSection />
      <LayoutControls />
    </aside>
  )
}
