<template>
    <transition name="fade">
        <div ref="contextMenu" class="context-menu" :style="styles" v-show="showMenu" v-click-outside="onClickOutside"
            @mouseleave="startTimer" @mouseenter="clearTimer">
            <div class="menu-item" v-for="item in menuList" :key="item.label" :data-type="item.type" @click="onItemClick">
                <el-icon>
                    <component :is="item.icon" />
                </el-icon>
                <span class="menu-label">{{ item.label }}</span>
            </div>
        </div>
    </transition>
</template>
<script setup>
import { computed, ref } from 'vue';
import { ElIcon, ClickOutside as vClickOutside } from 'element-plus';
import { InfoFilled, Management, DeleteFilled, CirclePlusFilled } from '@element-plus/icons-vue';
const menuWidth = "112px"
const menuHeight = "144px"
const props = defineProps({
    xAxis: { type: Number, default: 0 },
    yAxis: { type: Number, default: 0 },
    target: { type: Object, default: () => { return {} } }
});
const emits = defineEmits(['openContextMenu', 'destroyContextMenu', 'contextMenuClick']);
const showMenu = ref(false);
const timer = ref(null);
const width = Number(menuWidth.replace("px", ""));
const height = Number(menuHeight.replace("px", ""));
const menuList = [
    { label: "详细信息", icon: InfoFilled, type: "info" },
    { label: "编辑书签", icon: Management, type: "edit" },
];
if (props.target.children) {
    menuList.push({ label: "添加书签", icon: CirclePlusFilled, type: "create" })
    if (props.target.children.length === 0) {
        menuList.push({ label: "删除书签", icon: DeleteFilled, type: "delete" })
    }
} else {
    menuList.push({ label: "删除书签", icon: DeleteFilled, type: "delete" })
}
const styles = computed(() => {
    return {
        left: document.documentElement.clientWidth - props.xAxis < width ? `${props.xAxis - width}px` : `${props.xAxis}px`,
        top: document.documentElement.clientHeight - props.yAxis < height ? `${props.yAxis - height}px` : `${props.yAxis}px`
    }
});

const closeMenu = () => {
    showMenu.value = false;
    emits('destroyContextMenu');
}
const onItemClick = (e) => {
    const type = e.currentTarget.dataset.type;
    emits('contextMenuClick', type)
    closeMenu()
}
const onClickOutside = () => {
    closeMenu()
}
const startTimer = () => {
    clearTimer();
    timer.value = setTimeout(closeMenu, 2000)
}
const clearTimer = () => {
    clearTimeout(timer.value)
}
defineExpose({ showMenu, closeMenu });
</script>
<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-active {
    transition: all 0.2s linear;
}

.fade-enter-from {
    opacity: 0;
    transform: translateY(-1rem);
}

.fade-leave-to {
    opacity: 0;
    transform: translateY(-1rem);
}

.context-menu {
    position: absolute;
    z-index: 1000;
    background-color: #fff;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
    border-radius:1rem;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-direction: column;
    width: v-bind(menuWidth);
    height: v-bind(menuHeight);
    box-sizing: border-box;
    padding: 0.5rem;
    .menu-item {
        font-size: 0.85rem;
        color: #999;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.1s;
        .menu-label {
            padding-left: 0.5rem;
        }
        &:hover {
            color: #409eff;
            transform: scale(1.1);
        }
    }
}
</style>