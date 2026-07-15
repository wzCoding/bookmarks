<template>
    <div class="page-form">
        <el-form ref="FormEl" :model="form" :rules="rules" :label-position="position" status-icon>
            <el-form-item v-for="item in formOptions" :key="item.name" v-show="item.show"
                :label="(locale.el as unknown as Record<string, Record<string, string>>)[localeKey][item.label]" :prop="item.name">
                <template v-if="item.type == 'input'">
                    <el-input v-model.lazy="form[item.name]" :placeholder="item.placeholder"
                        :disabled="item.disable ? item.disable : false" clearable
                        @input="item.onInput ? handleInput(FormEl, item.onInput) : ''" />
                </template>
                <template v-if="item.type == 'select'">
                    <el-select v-model="form[item.name]" :placeholder="item.placeholder"
                        @change="item.onChange ? handleSelect(FormEl, item.onChange) : ''">
                        <el-option v-for="option in item.options" :key="option.value"
                            :label="(locale.el as unknown as Record<string, Record<string, string>>)[localeKey][option.label]" :value="option.value" />
                    </el-select>
                </template>
                <template v-if="item.type == 'treeSelect'">
                    <el-tree-select ref="treeSelect" v-model="form[item.name]" :props="item.props" node-key="id"
                        :data="item.tree" :default-expand-all="true" :expand-on-click-node="false"
                        :render-after-expand="false" @node-click="(node: Record<string, unknown>) => { handleNode(node as unknown as TreeNode, item.nodeClick) }">
                        <!-- 动态插槽 -->
                        <template v-for="(value, name) in $slots" #[name]="{ node }">
                            <slot :name="name" v-bind="{ node }"></slot>
                        </template>
                    </el-tree-select>
                </template>
                <template v-if="item.type == 'number'">
                    <el-input-number :model-value="form[item.name] as number" :min="item.min" :max="item.max" @update:model-value="(val: number | undefined) => form[item.name] = val as number" />
                </template>
                <template v-if="item.type ==`radio`">
                    <el-radio-group v-model="form[item.name]">
                        <el-radio v-for="radio in item.options" :key="radio.value" :label="radio.label" size="large">{{
                            radio.label }}</el-radio>
                    </el-radio-group>
                </template>
            </el-form-item>
        </el-form>
        <div v-if="submit" class="form-button">
            <el-button round type="primary" @click="submitForm(FormEl)">{{ (locale.el as unknown as Record<string, Record<string, string>>)[localeKey]['submitText'] }}</el-button>
            <el-button round @click="resetForm(FormEl)">{{ (locale.el as unknown as Record<string, Record<string, string>>)[localeKey]['resetText'] }}</el-button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useLocaleStore } from '@/store/useLocaleStore'
import { storeToRefs } from 'pinia'
import type { ElTreeSelect } from 'element-plus'
import type { FormItem, FormData, FormRule, ElFormInstance } from '@/types'
import type { TreeNode } from '@/types'

interface Props {
  forms: FormItem[]
  position?: 'top' | 'right' | 'left'
  submit?: boolean
  localeKey: string
}
const props = withDefaults(defineProps<Props>(), {
  position: 'top',
  submit: true,
  localeKey: '',
})

const emit = defineEmits<{
  submit: [form: FormData]
  reset: [form: FormData]
}>()

const FormEl = ref<ElFormInstance | null>(null)
const treeSelect = ref<InstanceType<typeof ElTreeSelect>[] | null>(null)
const form = reactive<FormData>({})
const rules = reactive<Record<string, FormRule[]>>({})
const formOptions = reactive<FormItem[]>([])
const localeStore = useLocaleStore();
const { locale } = storeToRefs(localeStore);
if (props.forms.length) {
    props.forms.forEach(item => {
        item.show = item.show === undefined ? true : item.show;
        item.required = item.required === undefined ? false : item.required;
        item.type = item.type === undefined ? 'input' : item.type;
        form[item.name] = item.defaultValue === undefined ? '' : item.defaultValue;
        rules[item.name] = [{ required: item.required, message: item.requireMessage, validator: item.validator, trigger: 'blur' }];
        formOptions.push(item);
    });
}

function handleInput(el: ElFormInstance | null, callback: (form: FormData) => void) {
  if (!el) return
  callback && callback(form)
}
async function handleSelect(el: ElFormInstance | null, callback: (form: FormData) => void) {
  if (!el) return
  await el.clearValidate('type')
  callback && callback(form)
}
function handleNode(node: TreeNode, callback?: (id: string) => void) {
  // blur 在运行时可用但未在 ElTreeSelect 公开类型中暴露
  // @ts-expect-error blur is available at runtime
  treeSelect.value![0].blur()
  form.id = node.id
  form.index = 0
  callback && callback(form.id as string)
}
async function submitForm(el: ElFormInstance | null) {
  if (!el) return
  await el.validate((valid: boolean) => {
    if (valid) {
      console.log('submit')
      emit('submit', form)
    }
  })
}
function resetForm(el: ElFormInstance | null) {
  if (!el) return
  el.resetFields()
  emit('reset', form)
}
</script>
<style lang="scss" scoped>
.page-form {
    width: 100%;

    .form-button {
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

    :deep(.el-form.el-form--default) {
        .el-form-item__content {
            .el-input:not(.is-disabled) {
                .el-input__wrapper {
                    background-color: var(--el-input-bg-theme-color);
                }
            }

            .el-input-number {

                .el-input-number__decrease,
                .el-input-number__increase {
                    background-color: var(--el-input-number-bg-color);
                }
            }

            .el-input__inner {
                color: var(--text-color);
            }

        }
    }
}
</style>