<template>
    <div class="bookmark-page bookmark-setting">
        <Forms :forms="settings" locale-key="setting" @submit="submitSetting"></Forms>
    </div>
</template>
<script setup>
import Forms from '@/components/forms.vue';
import { useLocaleStore } from '@/store/useLocaleStore';
import { reactive } from 'vue';
import { ElLoading } from 'element-plus';
const localeStore = useLocaleStore();
const settings = reactive([
    {
        label: "theme",
        name: "theme",
        type: "select",
        defaultValue: "default",
        options: [
            { label: "defaultTheme", value: "default" },
            { label: "darkTheme", value: "dark" }
        ]
    },
    {
        label: "language",
        name: "language",
        type: "select",
        defaultValue: localeStore.language ? localeStore.language : "zhCn",
        options: [
            { label: "defaultLanguage", value: "zhCn" },
            { label: "enLanguage", value: "en" }
        ]
    }
])

const submitSetting = (form) => {
    console.log(form)
    const loading = ElLoading.service({ lock: true })
    setTimeout(() => {
        localeStore.toggle(form.language)
        loading.close()
    }, 1000)
}
</script>
