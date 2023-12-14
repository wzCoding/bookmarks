<template>
    <el-form :model="form" label-position="top">
        <el-form-item v-for="item in forms" :key="item.name" :label="item.label">
            <el-input v-model="form[item.name]" />
        </el-form-item>
    </el-form>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { ElForm, ElFormItem, ElInput } from 'element-plus';
import { updateBookMark } from '@/utils/index';
const form = reactive({
    title:"",
    url:""
})
const forms = [
    {
        label: "书签名称:",
        name: "title",
    },
    {
        label: "书签地址:",
        name: "url",
    }

]
</script>
<style lang="scss" scoped>
.el-form.el-form--label-top{
    padding:1.25rem;
}
</style>