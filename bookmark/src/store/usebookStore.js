import { computed, reactive, ref } from "vue";
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
    const parentId = ref(defaultId);
    const currentTitle = ref(defaultShowTitle);
    const currentMarks = ref(getFolder(defaultShowId).children);

    //分页相关
    const pageSize = ref(defaultSize);
    const currentPage = ref(defaultPage);
    const pageCache = reactive({
        [defaultShowId]: defaultPage,
    })
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
        if (!id) return
        return allBookMarks.filter(item => item.id == id)[0];
    }
    function getMark(id) {
        if (!id) return
        return currentMarks.value.filter(item => item.id == id)[0];
    }
    //获取当前展示书签列表
    function getCurrentMarks(id, initPage) {
        if (!id) return;
       
        const folder = getFolder(id);
        currentMarks.value = folder.children;
        currentTitle.value = (!folder.title && folder.id == '0') ? defaultTitle : folder.title;
        parentId.value = folder.parentId ? folder.parentId : defaultShowId;
        //初始化分页参数
        if (initPage) {
            pageChange(defaultPage)
            sizeChange(defaultSize)
        } else {
            pageCache[id] ? pageChange(pageCache[id]) : (pageCache[id] = defaultPage);
        }
    }
    function getAllNode(id, result = []) {
        if (!id) return []
        const node = allBookMarks.filter(item => item.id == id)[0];
        if (node && node.parentId) {
            result.push({ title: node.title, id: node.id, type: node.children ? 'folder' : 'bookmark' });
            getAllNode(node.parentId, result)
        }
        return result;
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
        pageCache,
        totalNum,
        totalPage,
        getCurrentMarks,
        getMark,
        getAllNode,
        sizeChange,
        pageChange
    }
})