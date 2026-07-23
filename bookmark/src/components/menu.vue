<template>
    <el-dialog v-model="settingDialogVisible" class="book-mark-menu" :append-to-body="true" width="min(80%, 680px)"
        @close="closeDialog">
        <div class="menu-container">
            <div class="menu-aside">
                <template v-for="section in menuSections" :key="section.id">
                    <el-tooltip :visible="tipVisible[section.id]" :content="section.title" placement="right">
                        <div class="aside-item" :class="{ 'is-active': activeSectionId === section.id }"
                            @click="changeMenuContent(section.id)" @mouseenter="handleMouseEnter($event, section.id)"
                            @mouseleave="handleMouseLeave(section.id)">
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
                                <div class="title-row">
                                    <span>{{ item.title }}</span>
                                </div>
                                <div class="title-desc" v-if="item.desc">{{ item.desc }}</div>
                            </div>
                            <div class="list-item-content">
                                <!-- select 类型配置项 -->
                                <el-select v-if="item.type === 'select'" popper-class="list-item-popper"
                                    :show-arrow="false" placement="bottom-end" :model-value="settingValues[item.id]"
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
    /** 功能描述文本 */
    desc?: string
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
const tipVisible = reactive<Record<string, boolean>>({})
const localeStore = useLocaleStore()

// 统一管理所有配置项的当前值
const settingValues = reactive<Record<string, string | boolean>>({
    language: localeStore.language,
    theme: localeStore.theme,
    preview: false,
    aiTranslate: false,
    bookmarkStatus: false,
    browsingHistory: false,
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
                desc: localeStore.locale.el.setting.bookmarkPreviewDesc,
                type: 'switch',
                values: false,
                callback: (val) => {
                    console.log('书签页预览:', val ? '开启' : '关闭')
                },
            },
            {
                id: 'aiTranslate',
                title: localeStore.locale.el.setting.aiTranslate,
                desc: localeStore.locale.el.setting.aiTranslateDesc,
                type: 'switch',
                values: false,
                callback: (val) => {
                    console.log('AI翻译:', val ? '开启' : '关闭')
                },
            },
            {
                id: 'bookmarkStatus',
                title: localeStore.locale.el.setting.bookmarkStatus,
                desc: localeStore.locale.el.setting.bookmarkStatusDesc,
                type: 'switch',
                values: false,
                callback: (val) => {
                    console.log('书签状态:', val ? '开启' : '关闭')
                },
            },
            {
                id: 'browsingHistory',
                title: localeStore.locale.el.setting.browsingHistory,
                desc: localeStore.locale.el.setting.browsingHistoryDesc,
                type: 'switch',
                values: false,
                callback: (val) => {
                    console.log('浏览记录:', val ? '开启' : '关闭')
                },
            }
        ],
    },
])

const activeSection = computed(() =>
    menuSections.value.find(s => s.id === activeSectionId.value)
)

const changeMenuContent = (id: string) => {
    activeSectionId.value = id
}

const closeDialog = () => {
    emits('closeMenu', false)
}

/** 鼠标进入 aside-item：若 section-title 被隐藏则展示 tooltip */
const handleMouseEnter = (event: MouseEvent, sectionId: string) => {
    const target = event.currentTarget as HTMLElement
    const titleEl = target.querySelector<HTMLElement>('.section-title')
    if (titleEl) {
        const display = window.getComputedStyle(titleEl).display
        tipVisible[sectionId] = display === 'none'
    }
}

/** 鼠标离开 aside-item：隐藏对应 tooltip */
const handleMouseLeave = (sectionId: string) => {
    tipVisible[sectionId] = false
}
</script>
<style lang="scss">
.el-dialog.book-mark-menu {
    background-color: var(--bg-page);
    color: var(--text-primary);
    padding: 0;
    box-shadow:  0 0 6px 3px var(--shadow-active-color);
    .el-dialog__header {
        padding: 0;
    }

    .el-dialog__body {
        padding: 0;
    }

    .menu-container {
        display: flex;
        height: auto;
        color: var(--text-primary);
        font-size: 13px;
        max-height: 320px;
        overflow-y: auto;
        overflow-x: hidden;

        .menu-aside {
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
                    background-color: var(--bg-hover);
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
                        flex-direction: column;
                        justify-content: flex-start;
                        align-items: flex-start;
                        gap: var(--gap);

                        .title-row {
                            display: flex;
                            align-items: center;
                            gap: var(--gap);
                        }

                        .title-desc {
                            font-size: 11px;
                            color: var(--text-muted);
                            white-space: nowrap;
                        }
                    }

                    .list-item-content {
                        width: 48%;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;

                        .el-select {
                            .el-select__wrapper {
                                background-color: var(--bg-page);
                                box-shadow: none;
                                transition: none;

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

                        .el-switch {
                            &:not(.is-checked) {
                                .el-switch__core {
                                    background-color: var(--bg-page-secondary) !important;
                                }
                            }

                        }

                    }
                }
            }
        }
    }
}

.list-item-popper.el-popper.el-select__popper {
    max-width: 120px !important;

    .el-select-dropdown.list-item-popper {
        max-width: 120px !important;
        min-width: 120px !important;
    }
}
</style>