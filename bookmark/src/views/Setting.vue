<template>
    <div class="bookmark-setting">
        <Forms :forms="settings" submit-text="保存" @submit="submitSetting"></Forms>
    </div>
</template>
<script setup>
import Forms from '@/components/forms.vue';
import { usebookStore } from '@/store/usebookStore';
const bookStore = usebookStore();
bookStore.currentTitle = "书签设置"
const settings = [
    {
        label: "主题:",
        name: "theme",
        type: "select",
        defaultValue: "light",
        options: [
            { label: "默认", value: "light" },
            { label: "暗黑", value: "dark" }
        ]
    },
    {
        label: "语言:",
        name: "lang",
        type: "select",
        defaultValue: "zh-cn",
        options: [
            { label: "中文", value: "zh-cn" },
            { label: "英文", value: "en" }
        ]
    }
]
const submitSetting = (form) => {
   console.log(form)
}
</script>
<style lang="scss" scoped>
.bookmark-setting {
    --padding: 1.25rem;
    width: calc(100% - 2 * var(--padding));
    height: calc(100% - 2 * var(--padding));
    background-color: #fff;
    padding: var(--padding);
}
</style>