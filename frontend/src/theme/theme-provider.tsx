import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

export type Theme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const STORAGE_KEY = 'negar-theme'
const LEGACY_STORAGE_KEY = 'libro-theme'

function getInitialTheme(): Theme {
  const nextTheme = localStorage.getItem(STORAGE_KEY)
  if (nextTheme === 'dark' || nextTheme === 'light') return nextTheme

  const legacyTheme = localStorage.getItem(LEGACY_STORAGE_KEY)
  if (legacyTheme === 'dark' || legacyTheme === 'light') {
    localStorage.setItem(STORAGE_KEY, legacyTheme)
    return legacyTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  const setTheme = useCallback((nextTheme: Theme) => setThemeState(nextTheme), [])
  const toggleTheme = useCallback(() => setThemeState((curr) => (curr === 'light' ? 'dark' : 'light')), [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
