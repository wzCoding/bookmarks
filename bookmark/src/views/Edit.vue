<template>
  <div class="bookmark-page bookmark-edit">
    <Title :title="title" @update:title="updateTitle" />
    <Forms :forms="forms" :locale-key="page" @submit="submitForm" @reset="resetForm">
      <template #default="{ node }">
        <div class="custom-tree-node">
          <el-icon>
            <Folder />
          </el-icon>
          <span class="tree-node-label">{{ node.label }}</span>
        </div>
      </template>
    </Forms>
    <el-alert class="page-info" type="info" :title="tipTitle" :description="tipDesc" show-icon />
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { MessageService } from '@/components/message/message'
import { LoadingService } from '@/components/loading/loading'
import { Folder } from '@element-plus/icons-vue'
import { usebookStore } from '@/store/usebookStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { updateBookMark, moveBookMark, expandTree } from '@/utils/index'
import Forms from '@/components/forms.vue'
import Title from '@/components/title.vue'
import type { FormItem, FormData, LocaleTipItem } from '@/types'

interface Props {
  id: string
}
const props = withDefaults(defineProps<Props>(), {
  id: '0',
})
const page = 'edit'
const title = ref<string>('')
const bookStore = usebookStore()
const localeStore = useLocaleStore()
const targetNode = bookStore.getNodeById(props.id)
title.value = targetNode && targetNode.title ? targetNode.title : '--'
const regExp = /^(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?/=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/
const forms = reactive<FormItem[]>([])
const maxIndex = ref<number>(0)
const tipTitle = (localeStore.locale.el[page].tips as LocaleTipItem[])[0].title
const tipDesc = (localeStore.locale.el[page].tips as LocaleTipItem[])[0].text
if (targetNode) {
  updateMaxIndex(targetNode.parentId!);
  forms.push(
    { label: "bookmarkName", name: "title", placeholder: targetNode.title, defaultValue: "", onInput: updateTitle },
    {
      label: "bookmarkLocation",
      name: "parentId",
      placeholder: "请选择书签位置",
      type: "treeSelect",
      tree: bookStore.getTreeNodes("children"),
      defaultValue: targetNode.parentId,
      props: { label: "title" },
      nodeClick: updateMaxIndex
    },
    {
      label: "bookmarkOrder",
      name: "index",
      placeholder: "",
      type: "number",
      defaultValue: targetNode.index,
      min: 0,
      max: maxIndex.value,
      requireMessage: "请设置有效的顺序",
      validator: validateParam
    },
  )
  if (!targetNode.children) {
    forms.splice(
      1,
      0,
      {
        label: "websiteLink",
        name: "url",
        placeholder: targetNode.url,
        defaultValue: "",
        requireMessage: "请输入有效的网址链接",
        validator: validateParam
      })
  }
}
function updateTitle(param: unknown) {
  const p = param as FormData
  title.value = p.title ? (p.title as string) : (targetNode?.title ?? '--')
}
function updateMaxIndex(id: string) {
  const node = bookStore.getNodeById(id)
  maxIndex.value = node?.children?.length ?? 0
}
async function validateParam(rule: unknown, value: unknown, callback: (error?: Error) => void) {
  const val = value as string
  return new Promise<void>((resolve, reject) => {
    if ((rule as { field: string }).field == 'index') {
      val ? (Number(val) > 0 && Number(val) <= forms[forms.length - 1].max! ? resolve() : reject(new Error((rule as { message: string }).message))) : resolve()
    }
    if ((rule as { field: string }).field == 'url') {
      val ? (regExp.test(val) ? resolve() : reject(new Error((rule as { message: string }).message))) : resolve()
    }
  })
    .then(() => {
      callback && callback()
    })
    .catch((err: Error) => {
      callback && callback(err)
    })
}
function submitForm(param: FormData) {
  const loading = LoadingService({ lock: true })
  const options: { title?: string; url?: string } = {}
  const moveOptions = {
    index: param.index as number,
    parentId: param.parentId as string,
  }
  param.title ? (options.title = param.title as string) : null
  param.url ? (options.url = param.url as string) : null
  Promise.all([updateBookMark(props.id, options), moveBookMark(props.id, moveOptions)]).then(() => {
    chrome.bookmarks.getTree().then((result) => {
      bookStore.initNodes(expandTree(result), targetNode!.parentId!)
    })
    setTimeout(() => {
      loading.close()
      MessageService({
        type: 'success',
        message: localeStore.locale.el[page].successTip as string,
      })
    }, 1000)
  }).catch(error => {
    loading.close()
    console.log(error)
  })
}
function resetForm() {
  title.value = targetNode?.title ?? '--'
}
</script>
<style lang="scss" scoped>
.page-info {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--el-alert-bg-theme-color) !important;
}
</style>