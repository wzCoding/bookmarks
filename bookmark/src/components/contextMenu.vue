<template>
    <transition name="fade">
        <div ref="contextMenu" class="context-menu" :style="styles" v-show="showMenu" v-click-outside="onClickOutside">
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
import { ElIcon, ClickOutside as vClickOutside, Mousewheel as vMouseWheel} from 'element-plus';
import { Warning, Edit, Delete, Plus } from '@element-plus/icons-vue';
const menuWidth = "100px"
const menuHeight = "144px"
const props = defineProps({
    xAxis: { type: Number, default: 0 },
    yAxis: { type: Number, default: 0 }
});
const emits = defineEmits(['openContextMenu', 'destroyContextMenu']);
const showMenu = ref(false);
const styles = computed(() => {
    console.log(document.documentElement.clientWidth, document.documentElement.clientHeight)
    console.log(props.xAxis, props.yAxis)
    const w = Number(menuWidth.replace("px", "")), h = Number(menuHeight.replace("px", ""));
    const result = {
        left: `${props.xAxis}px`,
        top: `${props.yAxis}px`
    }
    if (document.documentElement.clientWidth - props.xAxis < w) {
        result.left = `${props.xAxis - w}px`;
    }
    if (document.documentElement.clientHeight - props.yAxis < h) {
        result.top = `${props.yAxis - h}px`;
    }
    return result;
});
const menuList = [
    { label: "详细信息", icon: Warning, type: "info" },
    { label: "编辑书签", icon: Edit, type: "edit" },
    { label: "添加书签", icon: Plus, type: "update" },
    { label: "删除书签", icon: Delete, type: "delete" }
]
const closeMenu = () => {
    showMenu.value = false;
    emits('destroyContextMenu');
}
const onItemClick = (e) => {
    const type = e.currentTarget.dataset.type;
    console.log(type)
}
const onClickOutside = () => {
    closeMenu()
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
    border-radius: 5px;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-direction: column;
    width: v-bind(menuWidth);
    height: v-bind(menuHeight);

    .menu-item {
        width: 100%;
        font-size: 0.75rem;
        color: #999;
        cursor: pointer;
        padding: .5rem 0;
        display: flex;
        justify-content: center;
        align-items: center;

        .menu-label {
            padding-left: .25rem;
        }

        &:hover {
            color: #409eff;
        }

        &:first-child {
            padding-top: 1rem;
        }

        &:last-child {
            padding-bottom: 1rem;
        }
    }
}
</style>