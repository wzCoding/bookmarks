<template>
    <div class="bookmark-header" :style="headerStyle"></div>
</template>
<script setup>
import { computed } from 'vue';

const props = defineProps({
    height: String,
});
const headerStyle = computed(() => {
    return {
        height: props.height
    }
})
</script>
<style lang="scss" scoped>
.bookmark-header {
    width: 100%;
    border-bottom: 1px solid #ddd;
}
</style>