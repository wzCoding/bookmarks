import { locales } from '@/utils/locale'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const languageKey = "bookmark-language"
const themeKey = "bookmark-theme"
const defaultLang = "zhCn"
const defaultTheme = "default"
export const useLocaleStore = defineStore('locale', () => {
    const theme = ref(getCache(themeKey) ? getCache(themeKey) : defaultTheme)
    const language = ref(getCache(languageKey) ? getCache(languageKey) : defaultLang);
    const locale = computed(() => locales[language.value])
    function toggleLanguage(lang) {
        language.value = lang
        setCache(languageKey, language.value)
    }
    function toggleTheme(name) {
        theme.value = name
        setCache(themeKey, theme.value)
    }
    function setCache(key, value) {
        window.localStorage.setItem(key, value)
    }
    function getCache(key) {
        return window.localStorage.getItem(key)
    }
    return {
        language,
        theme,
        locale,
        toggleLanguage,
        toggleTheme
    }
})