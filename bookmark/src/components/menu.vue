<template>
    <el-dialog v-model="settingDialogVisible" class="book-mark-menu" :append-to-body="true"
        :title="localeStore.locale.el.setting.pageTitle"
        width="min(90%, 680px)" @close="closeDialog">
        <div class="menu-container">
            <!-- 左侧垂直菜单栏 -->
            <div class="menu-sidebar" :class="{ collapsed: isCollapsed }">
                <el-menu
                    :default-active="activeMenu"
                    :collapse="isCollapsed"
                    :collapse-transition="false"
                    class="sidebar-menu"
                    @select="handleMenuSelect"
                >
                    <el-menu-item index="basic">
                        <svg-icon name="theme" size="18" />
                        <template #title>{{ localeStore.locale.el.setting.basicSettings }}</template>
                    </el-menu-item>
                    <el-menu-item index="feature">
                        <svg-icon name="enhance" size="18" />
                        <template #title>{{ localeStore.locale.el.setting.featureEnhance }}</template>
                    </el-menu-item>
                </el-menu>
                <!-- 折叠/展开按钮 -->
                <div class="collapse-btn" @click="toggleCollapse">
                    <el-icon :size="16">
                        <DArrowLeft v-if="!isCollapsed" />
                        <DArrowRight v-else />
                    </el-icon>
                </div>
            </div>
            <!-- 右侧内容面板 -->
            <div class="menu-content">
                <!-- 基础设置面板 -->
                <div v-show="activeMenu === 'basic'" class="setting-panel">
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
                </div>
                <!-- 功能增强面板 -->
                <div v-show="activeMenu === 'feature'" class="feature-panel">
                    <div class="feature-list">
                        <div v-for="feature in featureConfig" :key="feature.id" class="feature-list-item">
                            <div class="feature-item-title">
                                <svg-icon :name="feature.icon" size="18"></svg-icon>
                                <span>{{ feature.title }}</span>
                            </div>
                            <div class="feature-item-switch">
                                <el-switch
                                    v-model="featureModel[feature.id]"
                                    @change="(val: boolean) => feature.callback(val)"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </el-dialog>
</template>
<script setup lang="ts">
import SvgIcon from '@/components/svgIcon.vue'
import { DArrowLeft, DArrowRight } from '@element-plus/icons-vue'
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

interface FeatureProps {
    id: string
    icon: string
    title: string
    callback: (val: boolean) => void
}

const props = withDefaults(defineProps<SettingProps>(), {
    menuVisible: false
})
const emits = defineEmits<{ closeMenu: [menuVisible: boolean] }>()
const settingDialogVisible = computed(() => props.menuVisible)

const localeStore = useLocaleStore()

// 当前激活的菜单项
const activeMenu = ref<string>('basic')
// 菜单折叠状态
const isCollapsed = ref<boolean>(false)

// 从 store 初始化当前值，确保刷新后保持用户之前的选择
const menuModel = reactive<Record<string, string>>({
    language: localeStore.language,
    theme: localeStore.theme
})

// 双向同步：store 被外部修改时，menuModel 同步更新
watch(() => localeStore.language, (val) => { menuModel.language = val })
watch(() => localeStore.theme, (val) => { menuModel.theme = val })

// 功能开关状态
const featureModel = reactive<Record<string, boolean>>({
    bookmarkPreview: false
})

const menuConfig = computed<MenuProps[]>(() => [
    {
        id: 'language',
        icon: 'language',
        title: localeStore.locale.el.setting.languageSetting,
        type: 'select',
        options: [
            { label: localeStore.locale.el.setting.chineseLanguage, value: "zhCn" },
            { label: localeStore.locale.el.setting.englishLanguage, value: "en" }
        ],
        callback: (val: string) => {
            localeStore.toggleLanguage(val)
        }
    },
    {
        id: 'theme',
        icon: 'theme',
        title: localeStore.locale.el.setting.themeSetting,
        type: 'segmented',
        options: [
            { label: localeStore.locale.el.setting.lightTheme, value: "default", icon: "sun" },
            { label: localeStore.locale.el.setting.darkThemeLabel, value: "dark", icon: "moon" }
        ],
        callback: (val: string) => {
            localeStore.toggleTheme(val)
        }
    },
])

// 功能增强配置列表
const featureConfig = computed<FeatureProps[]>(() => [
    {
        id: 'bookmarkPreview',
        icon: 'enhance',
        title: localeStore.locale.el.setting.bookmarkPreview,
        callback: (val: boolean) => {
            // TODO: 实现书签页预览功能开关
            console.log('书签页预览:', val ? '开启' : '关闭')
        }
    }
])

// 菜单选择切换
const handleMenuSelect = (index: string) => {
    activeMenu.value = index
}

// 折叠/展开切换
const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value
}

const closeDialog = () => {
    emits('closeMenu', false)
}
</script>
<style lang="scss">
.el-dialog.book-mark-menu {
    background-color: var(--bg-sidebar);
    color: var(--text-primary);
    padding: 0;
    .el-dialog__header {
        .el-dialog__title,
        .el-dialog__headerbtn svg {
            color: var(--text-primary) !important;
        }
    }

    .el-dialog__body {
        padding: 0;
        border-top: 1px dashed var(--border-color);
    }

    .menu-container {
        display: flex;
        height: 360px;
    }

    // ========== 左侧菜单栏 ==========
    .menu-sidebar {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        width: 160px;
        border-right: 1px solid var(--border-color);
        background-color: var(--bg-card);
        transition: width 0.3s ease;
        overflow: hidden;

        &.collapsed {
            width: 64px;

            .sidebar-menu {
                .el-menu-item {
                    justify-content: center;
                    padding: 0 !important;
                }
            }
        }

        .sidebar-menu {
            flex: 1;
            border-right: none;
            background-color: transparent;

            // 使用 theme.scss 变量覆盖 el-menu 默认样式
            --el-menu-bg-color: transparent;
            --el-menu-text-color: var(--text-sidebar);
            --el-menu-hover-bg-color: var(--bg-hover);
            --el-menu-active-color: var(--el-color-primary);
            --el-menu-item-height: 48px;
            --el-menu-item-font-size: 14px;

            .el-menu-item {
                display: flex;
                align-items: center;
                gap: 8px;
                border-radius: 0;
                margin: 2px 4px;
                transition: background-color 0.2s, color 0.2s;

                &:hover {
                    color: var(--text-sidebar-hover);
                    background-color: var(--bg-hover);
                }

                &.is-active {
                    color: var(--el-color-primary);
                    background-color: var(--el-color-primary-hover);
                    border-right: 2px solid var(--el-color-primary);
                }
            }
        }

        .collapse-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 40px;
            border-top: 1px solid var(--border-color);
            cursor: pointer;
            color: var(--text-muted);
            transition: color 0.2s, background-color 0.2s;
            flex-shrink: 0;

            &:hover {
                color: var(--text-primary);
                background-color: var(--bg-hover);
            }
        }
    }

    // ========== 右侧内容区 ==========
    .menu-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--padding-primary);
        background-color: var(--bg-sidebar);

        // --- 基础设置面板 ---
        .setting-panel {
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
                        color: var(--text-muted);
                        font-size: 14px;
                    }

                    .list-item-content {
                        width: 140px;

                        .el-select {
                            .el-select__wrapper {
                                background-color: var(--bg-card);
                                box-shadow: 0 0 1px var(--shadow-active-color);

                                .el-select__selected-item.el-select__placeholder,
                                .el-icon.el-select__caret.el-select__icon {
                                    color: var(--text-primary);
                                }
                            }
                        }

                        .el-segmented {
                            --el-border-radius-base: calc(var(--border-radius) * 1.5);
                            background-color: var(--bg-card);
                            color: var(--text-primary);

                            .el-segmented__item.is-selected {
                                color: var(--text-secondary);
                            }

                            .segmented-option {
                                display: flex;
                                justify-content: flex-start;
                                align-items: center;
                                gap: var(--gap);
                            }

                            .el-segmented__item:not(.is-disabled):not(.is-selected):hover {
                                color: var(--el-color-primary);
                                background: var(--el-color-primary-hover);
                            }
                        }
                    }
                }
            }
        }

        // --- 功能增强面板 ---
        .feature-panel {
            .feature-list {
                display: flex;
                flex-direction: column;
                gap: calc(var(--gap) * 3);

                .feature-list-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 0;

                    .feature-item-title {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        gap: var(--gap);
                        color: var(--text-primary);
                        font-size: 14px;
                    }

                    .feature-item-switch {
                        flex-shrink: 0;
                    }
                }
            }
        }
    }
}
</style>