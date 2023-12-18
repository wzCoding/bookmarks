<template>
    <div class="book-search">
         
    </div>
</template>
<script setup>
const props = defineProps({
    title: { type: String, default: '' },
});
defineEmits(['search'])
</script>
<style lang="scss" scoped>
.book-search {
    --padding:1rem;
    width: calc(100% - var(--padding) * 2);
    padding: var(--padding);
    font-size: 1.25rem;
    background-color: #EBEDF0;
    border-radius: 5px;
    color: #333;
    word-break: break-word;
}
</style>