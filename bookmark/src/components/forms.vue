<template>
    <div class="page-form">
        <el-form ref="FormEl" :model="form" :rules="rules" :label-position="position" status-icon>
            <el-form-item v-for="item in formOptions" :key="item.name" v-show="item.show" :label="locale.el[localeKey][item.label]"
                :prop="item.name">
                <template v-if="item.type == 'input'">
                    <el-input v-model.lazy="form[item.name]" :placeholder="item.placeholder"
                        :disabled="item.disable ? item.disable : false" clearable
                        @input="item.onInput ? handleInput(FormEl, item.onInput) : ''" />
                </template>
                <template v-if="item.type == 'select'">
                    <el-select v-model="form[item.name]" :placeholder="item.placeholder"
                        @change="item.onChange ? handleSelect(FormEl, item.onChange) : ''">
                        <el-option v-for="option in item.options" :key="locale.el[localeKey][option.value]" :label="locale.el[localeKey][option.label]"
                            :value="locale.el[localeKey][option.value]" />
                    </el-select>
                </template>
                <template v-if="item.type == 'treeSelect'">
                    <el-tree-select ref="treeSelect" v-model="form[item.name]" :props="item.props" node-key="id"
                        :data="item.tree" :default-expand-all="true" :expand-on-click-node="false"
                        :render-after-expand="false" @node-click="(node) => { handleNode(node, item.nodeClick) }">
                        <!-- 动态插槽 -->
                        <template v-for="(value, name) in $slots" #[name]="{ node }">
                            <slot :name="name" v-bind="{ node }"></slot>
                        </template>
                    </el-tree-select>
                </template>
                <template v-if="item.type == 'number'">
                    <el-input-number v-model="form[item.name]" :min="item.min" :max="item.max" />
                </template>
                <template v-if="item.type == 'radio'">
                    <el-radio-group v-model="form[item.name]">
                        <el-radio v-for="radio in item.options" :key="radio.value" :label="radio.label" size="large">{{
                            radio.label }}</el-radio>
                    </el-radio-group>
                </template>
            </el-form-item>
        </el-form>
        <div v-if="submit" class="form-button">
            <el-button round type="primary" @click="submitForm(FormEl)">{{ submitText }}</el-button>
            <el-button round @click="resetForm(FormEl)">{{ resetText }}</el-button>
        </div>
    </div>
</template>
<script setup>
import { ref, reactive } from 'vue';
import { useLocaleStore } from '@/store/useLocaleStore';
import { ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElTreeSelect, ElOption, ElInputNumber, ElRadioGroup, ElRadio } from 'element-plus';
import { storeToRefs } from 'pinia';
const props = defineProps({
    forms: { type: Array, default: () => [] },
    position: { type: String, default: 'top' },
    submit: { type: Boolean, default: true },
    submitText: { type: String, default: '提交' },
    resetText: { type: String, default: '重置' },
    localeKey: { type: String, default: '' }
});
const emit = defineEmits(['submit', 'reset']);
const FormEl = ref();
const treeSelect = ref();
const form = reactive({});
const rules = reactive({});
const formOptions = reactive([]);
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

function handleInput(el, callback) {
    callback && callback(form)
}
async function handleSelect(el, callback) {
    await el.clearValidate("type")
    callback && callback(form)
}
function handleNode(node, callback) {
    treeSelect.value[0].blur();
    form.id = node.id;
    form.index = 0;
    callback && callback(form.id);
}
async function submitForm(el) {
    if (!el) return;
    await el.validate(valid => {
        if (valid) {
            console.log("submit");
            emit('submit', form);
        }
    })
}
function resetForm(el) {
    if (!el) return;
    el.resetFields();
    emit('reset', form);
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
}
</style>