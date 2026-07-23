<template>
    <el-dialog v-model="settingDialogVisible" class="book-mark-menu" :append-to-body="true" width="min(80%, 680px)"
        @close="closeDialog">
        <div class="menu-container">
            <div class="menu-aside">
                <!-- <div class="aside-item" v-for="section in menuSections" :key="section.id"
                    :class="{ 'is-active': activeSectionId === section.id }" @click="changeMenuContent(section.id)">
                    <svg-icon :name="section.icon" size="20" />
                    <span>{{ section.title }}</span>
                </div> -->
                <template v-for="section in menuSections" :key="section.id">
                    <el-tooltip :visible="tipVisible" effect="dark" :content="section.title" placement="right">
                        <div class="aside-item" :class="{ 'is-active': activeSectionId === section.id }"
                            @click="changeMenuContent(section.id)">
                            <svg-icon :name="section.icon" size="20" />
                            <span class="section-title">{{ section.title }}</span>
                        </div>
                    </el-tooltip>
                </template>
            </div>
            <div class="menu-content">
                <div class="content-box" v-if="activeSection">
                    <div class="bookmark-setting-title">{{ activeSection.title }}</div>
                    <div class="bookmark-setting-list">
                        <div v-for="item in activeSection.items" :key="item.id" class="setting-list-item">
                            <div class="list-item-title">
                                <span>{{ item.title }}</span>
                            </div>
                            <div class="list-item-content">
                                <!-- select 类型配置项 -->
                                <el-select v-if="item.type === 'select'" :model-value="settingValues[item.id]"
                                    @update:model-value="(val: string) => { settingValues[item.id] = val }"
                                    @change="item.callback">
                                    <el-option v-for="option in item.options" :key="option.value" :value="option.value"
                                        :label="option.label" />
                                </el-select>
                                <!-- switch 类型配置项 -->
                                <el-switch v-else-if="item.type === 'switch'" :model-value="settingValues[item.id]"
                                    @update:model-value="(val: boolean) => { settingValues[item.id] = val }"
                                    @change="item.callback" />
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
import { ref, reactive, computed, watch } from 'vue';
import { useLocaleStore } from '@/store/useLocaleStore'

interface SettingProps {
    menuVisible: boolean
}

/** 单个菜单配置项（如语言选择、开关等） */
interface MenuItem {
    id: string
    title: string
    type: 'select' | 'switch'
    /** select 类型的选项列表 */
    options?: { label: string; value: string }[]
    /** switch 类型的默认值 */
    values?: boolean
    callback?: (val: string | boolean) => void
}

interface MenuSection {
    id: string
    icon: string
    title: string
    items: MenuItem[]
}

const props = withDefaults(defineProps<SettingProps>(), {
    menuVisible: false
})
const emits = defineEmits<{ closeMenu: [menuVisible: boolean] }>()
const settingDialogVisible = computed(() => props.menuVisible)
const tipVisible = ref<boolean>(false)
const localeStore = useLocaleStore()

// 统一管理所有配置项的当前值
const settingValues = reactive<Record<string, string | boolean>>({
    language: localeStore.language,
    theme: localeStore.theme,
    preview: false,
})

// 双向同步：store 被外部修改时，settingValues 同步更新
watch(() => localeStore.language, (val) => { settingValues.language = val })
watch(() => localeStore.theme, (val) => { settingValues.theme = val })

// 当前激活的菜单分组 ID
const activeSectionId = ref('setting')

// 菜单分组配置（数据源）
const menuSections = computed<MenuSection[]>(() => [
    {
        id: 'setting',
        icon: 'setting',
        title: localeStore.locale.el.setting.basicSettings,
        items: [
            {
                id: 'language',
                title: localeStore.locale.el.setting.languageSetting,
                type: 'select',
                options: [
                    { label: localeStore.locale.el.setting.chineseLanguage, value: 'zhCn' },
                    { label: localeStore.locale.el.setting.englishLanguage, value: 'en' },
                ],
                callback: (val) => localeStore.toggleLanguage(val as string),
            },
            {
                id: 'theme',
                title: localeStore.locale.el.setting.themeSetting,
                type: 'select',
                options: [
                    { label: localeStore.locale.el.setting.lightTheme, value: 'default' },
                    { label: localeStore.locale.el.setting.darkThemeLabel, value: 'dark' },
                ],
                callback: (val) => localeStore.toggleTheme(val as string),
            },
        ],
    },
    {
        id: 'enhance',
        icon: 'enhance',
        title: localeStore.locale.el.setting.featureEnhance,
        items: [
            {
                id: 'preview',
                title: localeStore.locale.el.setting.bookmarkPreview,
                type: 'switch',
                values: false,
                callback: (val) => {
                    console.log('书签页预览:', val ? '开启' : '关闭')
                },
            },
        ],
    },
])

// 当前激活的菜单分组（从 menuSections 中查找）
const activeSection = computed(() =>
    menuSections.value.find(s => s.id === activeSectionId.value)
)

const changeMenuContent = (id: string) => {
    activeSectionId.value = id
}

const closeDialog = () => {
    emits('closeMenu', false)
}
</script>
<style lang="scss">
.el-dialog.book-mark-menu {
    background-color: var(--bg-page);
    color: var(--text-primary);
    padding: 0;

    .el-dialog__header {
        padding: 0;
    }

    .el-dialog__body {
        padding: 0;
    }

    .menu-container {
        display: flex;
        height: 240px;
        color: var(--text-primary);
        font-size: 13px;

        .menu-aside {
            height: 100%;
            box-sizing: border-box;
            border-right: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            gap: var(--gap);
            padding: var(--padding-tertiary);

            .aside-item {
                display: flex;
                justify-content: flex-start;
                align-items: flex-start;
                gap: var(--gap);
                padding: var(--padding-tertiary);
                border-radius: var(--border-radius);
                cursor: pointer;
                width: 100%;
                box-sizing: border-box;

                &:hover {
                    background-color: var(--el-color-primary-hover);
                }

                &.is-active {
                    background-color: var(--el-color-primary-hover);
                    color: var(--el-color-primary);
                }
            }
        }

        .menu-content {
            flex: 1;
            height: 100%;

            .content-box {
                padding: var(--padding-primary);
            }

            .bookmark-setting-title {

                padding-bottom: var(--padding-secondary);
                border-bottom: 1px solid var(--border-color);
                font-size: 14px;
            }

            .bookmark-setting-list {
                display: flex;
                flex-direction: column;
                gap: calc(var(--gap) * 3);
                padding-top: var(--padding-secondary);
                padding-top: var(--padding-secondary);

                .setting-list-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid var(--border-color);
                    padding-bottom: var(--padding-tertiary);

                    .list-item-title {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        gap: var(--gap);
                    }

                    .list-item-content {
                        width: 68%;

                        .el-select {
                            .el-select__wrapper {
                                background-color: var(--bg-page);
                                box-shadow: none;

                                .el-select__selection,
                                .el-select__selected-item.el-select__input-wrapper {
                                    text-align: right;
                                }

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
    }
}
</style>