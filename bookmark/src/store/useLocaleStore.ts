import { locales } from '@/utils/locale'
import { defineStore } from 'pinia'
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { LocaleData } from '@/types'

const languageKey = 'bookmark-language'
const themeKey = 'bookmark-theme'
const defaultLang = 'zhCn'
const defaultTheme = 'default'

let firstFlag = true

export const useLocaleStore = defineStore('locale', () => {
  const theme: Ref<string> = ref(
    getCache(themeKey) ? (getCache(themeKey) as string) : defaultTheme
  )
  const language: Ref<string> = ref(
    getCache(languageKey) ? (getCache(languageKey) as string) : defaultLang
  )
  const locale: ComputedRef<LocaleData> = computed(() => locales[language.value])

  if (firstFlag) {
    firstFlag = false
    if (theme.value !== defaultTheme) toggleTheme(theme.value)
    if (language.value !== defaultLang) toggleLanguage(language.value)
  }

  function toggleLanguage(lang: string): void {
    language.value = lang
    setCache(languageKey, language.value)
  }

  function toggleTheme(name: string): void {
    theme.value = name
    document.documentElement.setAttribute('data-theme', name)
    setCache(themeKey, theme.value)
  }

  function setCache(key: string, value: string): void {
    window.localStorage.setItem(key, value)
  }

  function getCache(key: string): string | null {
    return window.localStorage.getItem(key)
  }

  return {
    language,
    theme,
    locale,
    toggleLanguage,
    toggleTheme,
  }
})
