<template>
    <div class="bookmark-setting">
        <Forms :forms="settings" locale-key="settingPage" @submit="submitSetting"></Forms>
    </div>
</template>
<script setup>
import Forms from '@/components/forms.vue';
import { usebookStore } from '@/store/usebookStore';
import { useLocaleStore } from '@/store/useLocaleStore';
import { reactive } from 'vue';
const bookStore = usebookStore();
const localeStore = useLocaleStore();
bookStore.currentTitle = localeStore.locale.settingPage.pageTitle;
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
        defaultValue: "zhCn",
        options: [
            { label: "defaultLanguage", value: "zhCn" },
            { label: "enLanguage", value: "en" }
        ]
    }
])

const submitSetting = (form) => {
    console.log(form)
    localeStore.toggle(form.language)
    //bookStore.currentTitle = localeStore.locale.settingPage.pageTitle;

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