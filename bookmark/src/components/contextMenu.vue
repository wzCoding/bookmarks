<template>
    <div class="context-menu">
        contextmenu
    </div>
</template>
<script setup>
import { computed } from 'vue';
import { ElConfigProvider, ElPagination } from 'element-plus';

const props = defineProps({
    xAxis: { type: Number, default: 0 },
    yAxis: { type: Number, default: 0 }
});

const emits = defineEmits(['openContextMenu']);
</script>
<style lang="scss" scoped></style>