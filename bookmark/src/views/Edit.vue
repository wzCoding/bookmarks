<template>
    <div class="bookmark-edit">
        <Title :title="form.title ? form.title : targetMark.title ? targetMark.title : '--'"/>
        <Forms :form="form" submit-text="更新"></Forms>
    </div>
</template>
<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { usebookStore } from '@/store/usebookStore';
import { updateBookMark } from '@/utils/index';
import Forms from '@/components/forms.vue';
import Title from '@/components/title.vue';
const props = defineProps({
    id: { type: String, default: "0", required: true }
});
const EditForm = ref();
const bookStore = usebookStore();
bookStore.currentTitle = "编辑书签"
const targetMark = bookStore.getMark(props.id) ? bookStore.getMark(props.id) : { title: "" };
const form = reactive({ title: "", url: "" });
const rules = reactive({
    title: [{ required: false, trigger: 'blur' }],
    url: [{ required: false, message: '请输入有效的url地址', trigger: 'blur', validator: validateUrl }]
});
const forms = [{ label: "书签名称:", name: "title", placeholder: "" }]
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;
async function validateUrl(rule, value, callback) {
    return new Promise((resolve, reject) => {
        if (value) {
            if (!regExp.test(value)) {
                reject(rule.message)
            } else {
                resolve()
            }
        } else {
            resolve()
        }
    }).then(() => {
        callback && callback();
    }).catch(err => {
        callback && callback(new Error(err));
    })
}
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
            // updateBookMark(option, (res) => {
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
if (targetMark) {
    forms[0].placeholder = targetMark.title;
    if(!targetMark.children){
        forms.push({ label: "书签地址:", name: "url", placeholder: targetMark.url })
    }
}
</script>
<style lang="scss" scoped>
.bookmark-edit {
    --padding: 1.25rem;
    padding: var(--padding);
    display: flex;
    justify-content: flex-start;
    align-items: flex-end;
    flex-direction: column;
    width: calc(100% - var(--padding) * 2);
    transition: all 0.3s;

    .edit-title {
        background: #F0F2F5;
        padding: var(--padding);
        cursor: pointer;
        border-radius: 4px;
        font-size: 1rem;
        width: calc(100% - var(--padding) * 2);
    }

    :deep(.el-form.el-form--label-top) {
        width: 100%;
        padding: 0.5rem 0;
    }
}
</style>