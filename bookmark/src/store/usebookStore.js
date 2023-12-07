import { computed, ref, watch } from "vue";
import { defineStore } from "pinia";

let allBookMarks = [];
//展开书签tree，便于操作
function expandTree(tree, result = []) {
    for (let i = 0; i < tree.length; i++) {
        result.push(tree[i]);
        if (tree[i].children) {
            expandTree(tree[i].children, result);
        }
    }
    return result;
}
//获取书签tree
function getTree(result) {
    if (result) {
        allBookMarks = expandTree(result);
    } else {
        const data = require('../../public/background/data.json');
        allBookMarks = expandTree(data);
    }
}
getTree();

const defaultTitle = "我的书签";
const defaultShowTitle = "书签栏"
const defaultShowId = "1";
const defaultSize = 8;
const defaultPage = 1;

export const usebookStore = defineStore("bookmarks", () => {
    //书签展示相关
    const parentId = ref(null);
    const currentTitle = ref(defaultShowTitle);
    const currentMarks = ref(getFolder(defaultShowId).children);

    //分页相关
    const currentSize = ref(defaultSize);
    const currentPage = ref(defaultPage);
    //当前分页的书签列表
    const pageMarks = computed(() => {
        const startIndex = (currentPage.value - 1) * currentSize.value;
        const endIndex = startIndex + currentSize.value;
        return currentMarks.value.slice(startIndex, endIndex);
    });
    const totalNum = computed(() => {
        return currentMarks.value.length;
    });
    function getFolder(id) {
        return allBookMarks.filter(item => item.id == id)[0];
    }
    //获取当前展示书签列表
    function getCurrentMarks(id) {
        if (!id) return;
        const folder = getFolder(id);
        parentId.value = folder.parentId;
        currentMarks.value = folder.children;
        currentTitle.value = (!folder.title && folder.id == '0') ? defaultTitle : folder.title;
    }
    return {
        currentTitle,
        currentMarks,
        parentId,
        pageMarks,
        currentSize,
        currentPage,
        totalNum,
        getCurrentMarks
    }
})