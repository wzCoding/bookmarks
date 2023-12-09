<template>
    <div class="context-menu" :style="styleObject">
        contextmenu
    </div>
</template>
<script setup>
import { computed, ref } from 'vue';
const props = defineProps({
    xAxis: { type: Number, default: 0 },
    yAxis: { type: Number, default: 0 }
});
const emits = defineEmits(['openContextMenu']);
const left = ref(null);
const top = ref(null);
const styleObject = computed(() => {
    return {
        left: left.value ? `${left.value}px` : `${props.xAxis}px`,
        top: top.value ? `${top.value}px` : `${props.yAxis}px`
    }
});

defineExpose({ left, top })
</script>
<style lang="scss" scoped>
.context-menu {
    position: absolute;
    z-index: 1000;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 5px 0;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    /* 防止点击菜单后页面消失 */
    pointer-events: none;
    width: 200px;
    height: 300px;
    border-radius: 5px;
}
</style>