<template>
    <div class="bookmark-edit">
        <Title :title="title" @update:title="updateTitle" />
        <Forms :forms="forms" submit-text="更新" @submit="submitForm" @reset="resetForm"></Forms>
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
const title = ref("");
const bookStore = usebookStore();
const targetNode = bookStore.getNodeById(props.id);
bookStore.currentTitle = "编辑书签";
title.value = targetNode && targetNode.title ? targetNode.title : "--";
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/;

const forms = reactive([
    { label: "书签名称:", name: "title", placeholder: "", defaultValue: "", required: false, onInput: updateTitle }
])
if (targetNode) {
    forms[0].placeholder = targetNode.title;
    if (!targetNode.children) {
        forms.push({ label: "书签地址:", name: "url", placeholder: targetNode.url, defaultValue: "", required: false, validator: validateUrl })
    }
}
function updateTitle(param) {
   title.value = param.title ? param.title : targetNode && targetNode.title;
}
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
function submitForm(param) {
    console.log(param)
    // updateBookMark(option, (res) => {
    //     if (res) {
    //         ElMessage({
    //             type: 'success',
    //             message: `更新书签 '${option.title}' 成功`,
    //         })
    //     }
    // })
}
function resetForm() {
    title.value = targetNode && targetNode.title;
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
    height: calc(100% - var(--padding) * 2);
}
</style>