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
        defaultValue: localeStore.theme ? localeStore.theme : "default",
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
    const loading = ElLoading.service({ lock: true })
    new Promise((resolve, reject) => {
        const task = []
        if (form.theme !== localeStore.theme) {
            task.push({ name: "toggleTheme", value: form.theme })
        }
        if (form.language !== localeStore.language) {
            task.push({ name: "toggleLanguage", value: form.language })
        }
        if (task.length) {
            resolve(task)
        } else {
            reject()
        }
    }).then(res => {
        setTimeout(() => {
            loading.close()
            for (const task of res) {
                localeStore[task.name](task.value)
            }
        }, 1000)
    }).catch(err => {
        console.log(err)
    })
}
</script>
