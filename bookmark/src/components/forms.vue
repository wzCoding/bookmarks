<template>
    <el-form ref="FormEl" :model="form" :rules="rules" status-icon label-position="top">
        <el-form-item v-for="item in forms" v-show="item.show" :label="item.label" :prop="item.name">
            <el-input v-if="item.type == 'input'" v-model="form[item.name]" :placeholder="item.placeholder" clearable />
            <el-select v-if="item.type == 'select'" v-model="form[item.name]" :placeholder="item.placeholder"
                @change="item.onChange ? item.onChange(CreateForm) : ''">
                <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
        </el-form-item>
    </el-form>
    <div class="submit-edit">
        <el-button round type="primary" @click="submitForm(CreateForm)">添加</el-button>
        <el-button round @click="resetForm(CreateForm)">重置</el-button>
    </div>
</template>
<script setup>
import { ref ,reactive} from 'vue';
import { ElForm, ElFormItem, ElInput, ElButton, ElMessage, ElSelect, ElOption } from 'element-plus';
const props = defineProps({
    forms: {
        type: Array,
        default: () => [],
    },
    position: {
        type: String,
        default: 'top',
    }
});
const emit = defineEmits(['submit', 'reset']);
const FormEl = ref();
const form = reactive()
async function submitForm(el) {
    if (!form.title && !form.url) return;
    await el.validate(valid => {
        if (valid) {
            console.log("submit edit");
            const option = {
                id: targetMark.id,
                title: form.title ? form.title : targetMark.title,
                url: form.url ? form.url : targetMark.url
            }
            console.log(option)
            // createBookMark(option, (res) => {
            //     if (res) {
            //         ElMessage({
            //             type: 'success',
            //             message: `更新书签 '${option.title}' 成功`,
            //         })
            //     }
            // })
        }
    })
}
function resetForm(el) {
    if (!el) return;
    el.resetFields();
}
</script>
<style lang="scss" scoped></style>