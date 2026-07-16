<template>
    <el-dialog v-model="settingDialogVisible" :append-to-body="true" title="书签设置" width="min(80%,400px)"
        @close="closeDialog">
        <div class="bookmark-setting-list">
            <div v-for="menu in menuConfig" :key="menu.id" class="setting-list-item">
                <div class="list-item-title">
                    <svg-icon :name="menu.icon" size="18"></svg-icon>
                    <span>{{ menu.title }}</span>
                </div>
                <div class="list-item-content">
                    <el-select v-if="menu.type === 'select'" :model-value="menuModel[menu.id]"
                        @update:model-value="(val: string) => { menuModel[menu.id] = val }" @change="menu.callback">
                        <el-option v-for="option in menu.options" :key="option.value" :value="option.value"
                            :label="option.label" />
                    </el-select>
                    <el-segmented v-if="menu.type === 'segmented'" :model-value="menuModel[menu.id]"
                        @update:model-value="(val: string) => { menuModel[menu.id] = val }" :options="menu.options"
                        @change="menu.callback">
                        <template #default="scope">
                            <div class="segmented-option">
                                <svg-icon :name="scope.item.icon" size="14"></svg-icon>
                                <span>{{ scope.item.label }}</span>
                            </div>
                        </template>
                    </el-segmented>
                </div>
            </div>
        </div>
    </el-dialog>

</template>
<script setup lang="ts">
import SvgIcon from '@/components/svgIcon.vue'
import { ref, reactive, shallowReactive, computed } from 'vue';

interface SettingProps {
    menuVisible: boolean
}

interface MenuProps {
    id: string,
    icon: string,
    title: string,
    type: string,
    options?: { [key: string]: string }[],
    callback: (param: string) => void
}

const props = withDefaults(defineProps<SettingProps>(), {
    menuVisible: false
})
const emits = defineEmits<{ closeMenu: [menuVisible: boolean] }>()
const settingDialogVisible = computed(() => props.menuVisible)

const menuConfig: MenuProps[] = [
    {
        id: 'language',
        icon: 'language',
        title: '语言设置',
        type: 'select',
        options: [
            { label: "中文", value: "zh" },
            { label: "英文", value: "en" }
        ],
        callback: (val: string) => {
            console.log(val)
        }
    },
    {
        id: 'theme',
        icon: 'theme',
        title: '主题设置',
        type: 'segmented',
        options: [
            { label: "浅色", value: "light", icon: "sun" },
            { label: "深色", value: "dark", icon: "moon" }
        ],
        callback: (val: string) => {
            console.log(val)
        }
    },
]

const menuModel = reactive<Record<string, string>>({
    language: 'zh',
    theme: 'light'
})
const closeDialog = () => {
    emits('closeMenu', false)
}
</script>
<style lang="scss" scoped>
.bookmark-setting-list {
    display: flex;
    flex-direction: column;
    gap: calc(var(--gap) * 3);

    .setting-list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .list-item-title {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            gap: var(--gap);
            color: var(--text-primary);
            font-size: 14px;
        }

        .list-item-content {
            width: 140px;

            .el-segmented {
                --el-border-radius-base: calc(var(--border-radius) * 1.5);

                .el-segmented__item.is-selected {
                    color: var(--text-muted);
                }

                .segmented-option {
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: var(--gap);
                }
            }
        }
    }
}
</style>