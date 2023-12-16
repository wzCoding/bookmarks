<template>
    <h1 class="page-title">{{ title }}</h1>
</template>
<script setup>
const props = defineProps({
    title: { type: String, default: '' },
});
</script>
<style lang="scss" scoped>
.page-title {
    --padding:1rem;
    width: calc(100% - var(--padding) * 2);
    padding: var(--padding);
    font-size: 1.25rem;
    background-color: #EBEDF0;
    border-radius: 5px;
    color: #333;
}
</style>