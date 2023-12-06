import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import { defineStore } from 'pinia'
import { ref,computed } from 'vue'

const cacheKey = "bookmark-lang"
const ZH_CN = 'zh-cn'
const EN = 'en'

export const usei18nStore = defineStore('i18n', () => {
    const language = ref(getCache() || ZH_CN);
    const locale = computed(() => (language.value === ZH_CN ? zhCn : en))
    function toggle() {
        language.value = language.value === ZH_CN ? EN : ZH_CN
        setCache(language.value)
    }
    function setCache(lang) {
        localStorage.setItem(cacheKey, lang)
    }
    function getCache() {
        return localStorage.getItem(cacheKey)
    }
    return {
        locale,
        toggle
    }
})