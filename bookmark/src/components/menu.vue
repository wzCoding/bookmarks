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
import { ref, reactive, computed, watch } from 'vue';
import { useLocaleStore } from '@/store/useLocaleStore'

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

const localeStore = useLocaleStore()

// 从 store 初始化当前值，确保刷新后保持用户之前的选择
const menuModel = reactive<Record<string, string>>({
    language: localeStore.language,
    theme: localeStore.theme
})

// 双向同步：store 被外部修改时，menuModel 同步更新
watch(() => localeStore.language, (val) => { menuModel.language = val })
watch(() => localeStore.theme, (val) => { menuModel.theme = val })

const menuConfig: MenuProps[] = [
    {
        id: 'language',
        icon: 'language',
        title: '语言设置',
        type: 'select',
        options: [
            { label: "中文", value: "zhCn" },
            { label: "英文", value: "en" }
        ],
        callback: (val: string) => {
            localeStore.toggleLanguage(val)
        }
    },
    {
        id: 'theme',
        icon: 'theme',
        title: '主题设置',
        type: 'segmented',
        options: [
            { label: "浅色", value: "default", icon: "sun" },
            { label: "深色", value: "dark", icon: "moon" }
        ],
        callback: (val: string) => {
            localeStore.toggleTheme(val)
        }
    },
]

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