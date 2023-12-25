import { locales } from '@/utils/locale'
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const cacheKey = "bookmark-locale"
const defaultLang = "zhCn"
export const useLocaleStore = defineStore('locale', () => {
    console.log(getCache())
    const language = ref(getCache() ? getCache() : defaultLang);
    const locale = computed(() => locales[language.value])
    console.log(locale.value)
    function toggle(lang) {
        language.value = lang
        setCache(language.value)
    }
    function setCache(lang) {
        window.localStorage.setItem(cacheKey, lang)
    }
    function getCache() {
        return window.localStorage.getItem(cacheKey)
    }
    return {
        locale,
        toggle
    }
})