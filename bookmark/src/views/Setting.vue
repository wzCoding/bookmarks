<template>
    <div class="bookmark-page bookmark-setting">
        <Forms :forms="settings" locale-key="setting" @submit="submitSetting"></Forms>
    </div>
</template>
<script setup lang="ts">
import Forms from '@/components/forms.vue'
import { useLocaleStore } from '@/store/useLocaleStore'
import { reactive } from 'vue'
import ElLoading from 'element-plus/es/components/loading/index.mjs'
import type { FormItem, FormData, SettingTask } from '@/types'

const localeStore = useLocaleStore()
const settings = reactive<FormItem[]>([
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

const submitSetting = (form: FormData) => {
  const loading = ElLoading.service({ lock: true })
  new Promise<SettingTask[]>((resolve, reject) => {
    const task: SettingTask[] = []
    if (form.theme !== localeStore.theme) {
      task.push({ name: 'toggleTheme', value: form.theme as string })
    }
    if (form.language !== localeStore.language) {
      task.push({ name: 'toggleLanguage', value: form.language as string })
    }
    task.length ? resolve(task) : reject('nothing change')
  }).then(res => {
        setTimeout(() => {
            loading.close()
            for (const task of res) {
                localeStore[task.name](task.value)
            }
        }, 1000)
    }).catch(err => {
        console.log(err)
        loading.close()
    })
}
</script>
