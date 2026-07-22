<template>
    <el-dialog v-model="settingDialogVisible" class="book-mark-menu" :append-to-body="true" width="min(80%, 680px)"
        @close="closeDialog">
        <div class="menu-container">
            <div class="menu-aside">
                <div class="aside-item" v-for="item in menuTitle" :key="item.id" @click="changeMenuContent(item.id)">
                    <svg-icon :name="item.icon" size="20" />
                    <span>{{ item.title }}</span>
                </div>
            </div>
            <div class="menu-content">
                <template v-for="item in menuTitle" :key="item.id">
                    <div class="content-box" v-if="item.showContent">
                        <div class="bookmark-setting-title">{{ item.title }}</div>
                        <div class="bookmark-setting-list" v-if="item.id === 'setting'">
                            <div v-for="menu in menuContent.filter(i => i.menuType === 'basic')" :key="menu.id"
                                class="setting-list-item">
                                <div class="list-item-title">
                                    <span>{{ menu.title }}</span>
                                </div>
                                <div class="list-item-content">
                                    <el-select :model-value="menuModel[menu.id]"
                                        @update:model-value="(val: string) => { menuModel[menu.id] = val }"
                                        @change="menu.callback">
                                        <el-option v-for="option in menu.options" :key="option.value"
                                            :value="option.value" :label="option.label" />
                                    </el-select>
                                </div>
                            </div>
                        </div>
                        <div class="bookmark-setting-list" v-if="item.id === 'enhance'">
                            <div v-for="menu in menuContent.filter(i => i.menuType === 'basic')" :key="menu.id"
                                class="setting-list-item">
                                <div class="list-item-title">
                                    <span>{{ menu.title }}</span>
                                </div>
                                <div class="list-item-content">
                                    <el-select :model-value="menuModel[menu.id]"
                                        @update:model-value="(val: string) => { menuModel[menu.id] = val }"
                                        @change="menu.callback">
                                        <el-option v-for="option in menu.options" :key="option.value"
                                            :value="option.value" :label="option.label" />
                                    </el-select>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
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
interface MenuTitle {
    id: string,
    icon: string,
    title: string,
    showContent: boolean
}
interface MenuProps {
    id: string,
    icon?: string,
    title: string,
    menuType: string,
    contentType: string,
    options?: { [key: string]: string }[],
    values?: string | boolean | number,
    callback(param: string | boolean | number): void
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

const menuTitle = reactive<MenuTitle[]>([
    {
        title: localeStore.locale.el.setting.basicSettings,
        icon: 'setting',
        showContent: true,
        id: 'setting',
    },
    {
        title: localeStore.locale.el.setting.featureEnhance,
        icon: 'enhance',
        showContent: false,
        id: 'enhance'
    },
])

const menuContent = computed<MenuProps[]>(() => [
    {
        id: 'language',
        title: localeStore.locale.el.setting.languageSetting,
        menuType: 'basic',
        contentType: 'select',
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
        title: localeStore.locale.el.setting.themeSetting,
        menuType: 'basic',
        contentType: 'select',
        options: [
            { label: localeStore.locale.el.setting.lightTheme, value: "default" },
            { label: localeStore.locale.el.setting.darkThemeLabel, value: "dark" }
        ],
        callback: (val: string) => {
            localeStore.toggleTheme(val)
        }
    },
    {
        id: 'preview',
        title: localeStore.locale.el.setting.bookmarkPreview,
        menuType: 'enhance',
        contentType: 'switch',
        values: false,
        callback: (val: boolean) => {
            console.log('书签页预览:', val ? '开启' : '关闭')
        }
    },
])

const changeMenuContent = (id: string) => {
    menuTitle.forEach((item: MenuTitle) => {
        item.showContent = item.id === id
    })
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