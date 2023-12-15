<template>
    <el-form ref="FormEl" :model="form" :rules="rules" :label-position="position" status-icon>
        <el-form-item v-for="item in formOptions" v-show="item.show ? item.show : true" :label="item.label"
            :prop="item.name">
            <template v-if="item.type == 'input'">
                <el-input v-model="form[item.name]" :placeholder="item.placeholder" clearable />
            </template>
            <template v-if="item.type == 'select'">
                <el-select v-model="form[item.name]" :placeholder="item.placeholder"
                    @change="item.onChange ? item.onChange(CreateForm) : ''">
                    <el-option v-for="option in item.options" :key="option.value" :label="option.label"
                        :value="option.value" />
                </el-select>
            </template>
        </el-form-item>
    </el-form>
    <div class="submit-edit">
        <el-button round type="primary" @click="submitForm(FormEl)">添加</el-button>
        <el-button round @click="resetForm(FormEl)">重置</el-button>
    </div>
</template>
<script setup>
import { ref, reactive } from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElSelect, ElOption } from 'element-plus';
const props = defineProps({
    forms: { type: Array, default: () => [] },
    position: { type: String, default: 'top' },
    submitText: { type: String, default: '提交' },
    resetText: { type: String, default: '重置' }
});
const emit = defineEmits(['submit']);
const FormEl = ref();
const form = reactive({});
const rules = reactive({});
const formOptions = reactive([]);
if (props.forms.length) {
    props.forms.forEach(item => {
        form[item.name] = "";
        rules[item.name] = [{ required: item.required, message: item.requireMessage, validator: item.validate, trigger: 'blur' }];
        item.show = item.show === undefined ? true : item.show;
        formOptions.push(item)
    });
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
}
</script>
<style lang="scss" scoped>
.el-form {
    width: 100%;
    padding: 0.5rem 0;

    .el-select {
        width: 100%;
    }
}
</style>