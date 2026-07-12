<template>
    <div class="bookmark-page bookmark-create">
        <Title :title="targetNode?.title ?? ''" />
        <Forms :forms="forms" :locale-key="page" @submit="submitForm">
            <template #default="{ node }">
                <div class="custom-tree-node">
                    <el-icon>
                        <Folder />
                    </el-icon>
                    <span class="tree-node-label">{{ node.label }}</span>
                </div>
            </template>
        </Forms>
    </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage, ElLoading, ElIcon } from 'element-plus'
import { Folder } from '@element-plus/icons-vue'
import { usebookStore } from '@/store/usebookStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { createBookMark } from '@/utils/index'
import Forms from '@/components/forms.vue'
import Title from '@/components/title.vue'
import type { FormItem, FormData } from '@/types'

interface Props {
  id: string
}
const props = withDefaults(defineProps<Props>(), {
  id: '0',
})
const page = 'create'
const bookStore = usebookStore()
const localeStore = useLocaleStore()
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/
const targetNode = bookStore.getNodeById(props.id)
const urlIndex = 2
const forms = reactive<FormItem[]>([
    {
        label: "bookmarkType",
        name: "type",
        placeholder: localeStore.locale.el[page].typePlaceholder,
        type: "select",
        options: [
            { label: "bookmarkFolder", value: "folder" },
            { label: "websiteLink", value: "url" }
        ],
        show: true,
        required: true,
        requireMessage: localeStore.locale.el[page].typePlaceholder,
        onChange: typeChange
    },
    { label: "bookmarkName", name: "title", placeholder: localeStore.locale.el[page].namePlaceholder, type: "input", show: true, required: true, requireMessage: localeStore.locale.el[page].namePlaceholder },
    { label: "websiteLink", name: "url", placeholder: localeStore.locale.el[page].urlPlaceholder, type: "input", show: true, required: true, requireMessage: localeStore.locale.el[page].urlPlaceholder, validator: validateUrl },
    {
        label: "bookmarkLocation",
        name: "id",
        type: "treeSelect",
        tree: bookStore.getTreeNodes("children"),
        defaultValue: targetNode?.id,
        props: { label: "title" },
        show: true,
        required: true,
    }
])
async function validateUrl(rule: unknown, value: unknown, callback: (error?: Error) => void) {
  return new Promise<void>((resolve, reject) => {
    const val = value as string
    if (val) {
      !regExp.test(val) ? reject(new Error((rule as { message: string }).message)) : resolve()
    } else {
      !forms[urlIndex].required ? resolve() : reject(new Error((rule as { message: string }).message))
    }
  })
    .then(() => {
      callback && callback()
    })
    .catch((err: Error) => {
      callback && callback(err)
    })
}
function typeChange(form: Record<string, unknown>) {
  forms[urlIndex].required = forms[urlIndex].show = form.type === 'url'
}
function submitForm(param: FormData) {
  const loading = ElLoading.service({ lock: true })
  new Promise<{ parentId?: string; index?: number; title?: string; url?: string }>((resolve) => {
    const options: { parentId?: string; index?: number; title?: string; url?: string } = {
      index: param.index ? (param.index as number) : 0,
      parentId: param.parentId ? (param.parentId as string) : '1',
      title: param.title ? (param.title as string) : '',
    }
    if (param.url) {
      options.url = param.url as string
    }
    resolve(options)
  }).then((result) => {
    createBookMark(result, (res: chrome.bookmarks.BookmarkTreeNode) => {
      if (res) {
        setTimeout(() => {
          loading.close()
          ElMessage({
            type: 'success',
            message: localeStore.locale.el[page].successTip,
          })
        }, 1000)
      }
    })
  })
}
</script>
