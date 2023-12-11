<template>
    <div>{{ info.title }}</div>
</template>
<script setup>
import { usebookStore } from '@/store/usebookStore';
import { ref } from 'vue';
const props = defineProps(({
    id: { type: String, default: "0", required: true }
}))
const bookStore = usebookStore();
const info = bookStore.getMark(props.id)
console.log(info)
</script>
<style lang="scss" scoped></style>