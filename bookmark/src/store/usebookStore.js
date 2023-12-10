import { computed, ref } from "vue";
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
const defaultId = "0";
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
    const pageSize = ref(defaultSize);
    const currentPage = ref(defaultPage);
    //当前分页的书签列表
    const pageMarks = computed(() => {
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        return currentMarks.value.slice(startIndex, endIndex);
    });
    const totalNum = computed(() => {
        return currentMarks.value.length;
    });
    const totalPage = computed(() => {
        return Math.ceil(totalNum.value / pageSize.value);
    });
    function getFolder(id) {
        return allBookMarks.filter(item => item.id == id)[0];
    }
    //获取当前展示书签列表
    function getCurrentMarks(id,initPage) {
        if (!id){
            id = defaultId
        }
        //初始化分页参数
        if(initPage){
            pageChange(defaultPage)
            sizeChange(defaultSize)
        }
        const folder = getFolder(id);
        parentId.value = folder.parentId;
        currentMarks.value = folder.children;
        currentTitle.value = (!folder.title && folder.id == '0') ? defaultTitle : folder.title;
    }
    function sizeChange(size) {
        pageSize.value = size;
    }
    function pageChange(page) {
        currentPage.value = page < 1 ? 1 : (page > totalPage.value ? totalPage.value : page);
    }
    return {
        currentTitle,
        currentMarks,
        parentId,
        pageMarks,
        pageSize,
        currentPage,
        totalNum,
        totalPage,
        getCurrentMarks,
        sizeChange,
        pageChange
    }
})