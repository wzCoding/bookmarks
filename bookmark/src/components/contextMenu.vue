<template>
    <div class="context-menu" :style="styleObject">
        contextmenu
    </div>
</template>
<script setup>
import { computed, ref, watchEffect } from 'vue';
const props = defineProps({
    xAxis: { type: Number, default: 0 },
    yAxis: { type: Number, default: 0 }
});
const emits = defineEmits(['openContextMenu']);
const left = ref(props.xAxis);
const top = ref(props.yAxis);
const styleObject = ref(null);
const getPosition = (x, y) => {
    const left = `${x.value}px`
    const top = `${y.value}px`
    return {
        top,
        left
    }
}
watchEffect(() => {
    styleObject.value = getPosition(left, top);
})
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