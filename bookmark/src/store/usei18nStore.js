import { zhCn,en } from '@/utils/locale'
import { defineStore } from 'pinia'
import { ref,computed } from 'vue'

const cacheKey = "bookmark-lang"
const ZH_CN = 'zh-cn'
const EN = 'en'
console.log(zhCn)
console.log(en)
export const usei18nStore = defineStore('i18n', () => {
    const language = ref(getCache() || ZH_CN);
    const locale = computed(() => (language.value === ZH_CN ? zhCn : en))
    function toggle() {
        language.value = language.value === ZH_CN ? EN : ZH_CN
        setCache(language.value)
    }
   
    console.log(language.value)
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