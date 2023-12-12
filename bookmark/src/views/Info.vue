<template>
    <div>{{ info.title }}</div>
</template>
<script setup>
import { usebookStore } from '@/store/usebookStore';
import { ref } from 'vue';
const props = defineProps(({
    id: { type: String, default: "0", required: true }
}));
const defaultTitle = "详细信息"
const bookStore = usebookStore();
const info = bookStore.getMark(props.id)
console.log(info)
bookStore.currentTitle = defaultTitle;
</script>
<style lang="scss" scoped></style>