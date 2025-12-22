import { Preferences } from '@capacitor/preferences'

const VOICE_RATE_KEY = 'voice_rate'
const THEME_KEY = 'theme'

// Швидкість голосу
export async function getVoiceRate(): Promise<number> {
  const { value } = await Preferences.get({ key: VOICE_RATE_KEY })
  return value ? parseFloat(value) : 1.0
}

export async function setVoiceRate(rate: number): Promise<void> {
  await Preferences.set({
    key: VOICE_RATE_KEY,
    value: rate.toString(),
  })
}

// Тема
export async function getTheme(): Promise<string> {
  const { value } = await Preferences.get({ key: THEME_KEY })
  return value || 'system'
}

export async function setTheme(theme: string): Promise<void> {
  await Preferences.set({
    key: THEME_KEY,
    value: theme,
  })
}

export function applyTheme(theme: string) {
  const htmlElement = document.documentElement
  const bodyElement = document.body

  htmlElement.classList.remove('dark')
  bodyElement.classList.remove('dark')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (theme === 'dark' || (theme === 'system' && prefersDark)) {
    htmlElement.classList.add('dark')
    bodyElement.classList.add('dark')
  }

  console.log('Theme applied:', theme, 'Dark mode:', htmlElement.classList.contains('dark'))
}
