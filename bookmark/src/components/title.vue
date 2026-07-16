<template>
    <h1 class="page-title" :value="title">{{ title }}</h1>
</template>
<script setup lang="ts">
defineProps<{ title?: string }>()
defineEmits<{ 'update:title': [value: string] }>()
</script>
<style lang="scss" scoped>
.page-title {
    width: calc(100% - var(--padding-primary) * 2);
    padding: var(--padding-primary);
    font-size: 1.25rem;
    background-color: var(--bg-page-secondary);
    border-radius: 5px;
    color: var(--text-primary);
    word-break: break-word;
}
</style>