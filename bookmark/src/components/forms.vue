<template>
    <el-form ref="FormEl" :model="form" :rules="rules" :label-position="position" status-icon>
        <el-form-item v-for="item in formOptions" :key="item.name" v-show="item.show" :label="item.label" :prop="item.name">
            <template v-if="item.type == 'input'">
                <el-input v-model="form[item.name]" :placeholder="item.placeholder"
                    :disabled="item.disable ? item.disable : false" clearable />
            </template>
            <template v-if="item.type == 'select'">
                <el-select v-model="form[item.name]" :placeholder="item.placeholder"
                    @change="item.onChange ? selectChange(FormEl, item.onChange) : ''">
                    <el-option v-for="option in item.options" :key="option.value" :label="option.label"
                        :value="option.value" />
                </el-select>
            </template>
        </el-form-item>
    </el-form>
    <div v-if="submit" class="form-button">
        <el-button round type="primary" @click="submitForm(FormEl)">{{ submitText }}</el-button>
        <el-button round @click="resetForm(FormEl)">{{ resetText }}</el-button>
    </div>
</template>
<script setup>
import { ref, reactive } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElSelect, ElOption } from 'element-plus';
const props = defineProps({
    forms: { type: Array, default: () => [] },
    position: { type: String, default: 'top' },
    submit: { type: Boolean, default: true },
    submitText: { type: String, default: '提交' },
    resetText: { type: String, default: '重置' }
});
const emit = defineEmits(['submit', 'reset']);
const FormEl = ref();
const form = reactive({});
const rules = reactive({});
const formOptions = reactive([]);
if (props.forms.length) {
    props.forms.forEach(item => {
        item.show = item.show === undefined ? true : item.show;
        item.required = item.required === undefined ? false : item.required;
        item.type = item.type === undefined ? 'input' : item.type;
        form[item.name] = item.defaultValue ? item.defaultValue : '';
        rules[item.name] = [{ required: item.required, message: item.requireMessage, validator: item.validator, trigger: 'blur' }];
        formOptions.push(item);
    });
}
async function selectChange(el, callback) {
    await el.clearValidate("type")
    callback && callback(form)
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
.el-form {
    width: 100%;
    padding: 0.5rem 0;
}
</style>