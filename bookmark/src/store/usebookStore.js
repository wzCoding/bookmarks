import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";
import { getAllBookMarks, getRecentBookMarks,getTreeByKey, expandTree } from "@/utils";

//获取书签tree
// function getData() {
//   const data = require('../../public/background/data.json');
//   return expandTree(data);
// }


const defaultTitle = "我的书签";
const defaultId = "0";
const defaultShowTitle = "书签栏"
const defaultShowId = "1";
const defaultSize = 8;
const defaultPage = 1;
const tree = expandTree(await getAllBookMarks());
const recent = await getRecentBookMarks(10);
//const tree = getData();
export const usebookStore = defineStore("bookmarks", () => {
    let allNodes = tree;
    //书签展示相关
    const parentId = ref(defaultId);
    const currentTitle = ref(defaultShowTitle);
    const currentNodes = ref(getFolder(defaultShowId).children);
    const recentNodes = ref(recent);
    //分页相关
    const pageSize = ref(defaultSize);
    const currentPage = ref(defaultPage);
    const pageCache = reactive({
        [defaultShowId]: defaultPage,
    })
    //当前分页的书签列表
    const pageNodes = computed(() => {
        const startIndex = (currentPage.value - 1) * pageSize.value;
        const endIndex = startIndex + pageSize.value;
        return currentNodes.value.slice(startIndex, endIndex);
    });
    const total = allNodes.length;
    const currentTotal = computed(() => {
        return currentNodes.value.length;
    });
    const totalPage = computed(() => {
        return Math.ceil(currentTotal.value / pageSize.value);
    });
    function initNodes(nodes, id) {
        allNodes = nodes;
        currentNodes.value = getFolder(id).children;
    }
    function getFolder(id) {
        if (!id) return {};
        return allNodes.filter(item => item.id == id)[0];
    }
    function getTreeNodes(key) {
        return getTreeByKey(allNodes, defaultId, key);
    }
    function getNodeById(id) {
        if (!id) return {};
        return allNodes.filter(item => item.id == id)[0];
    }
    function getNodeByTitle(title) {
        if (!title) return;
        return allNodes.filter(item => item.title.includes(title));
    }
    //获取当前展示书签列表
    function getCurrentNodes(id, initPage) {
        if (!id) return;

        const folder = getFolder(id);
        currentNodes.value = folder.children;
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
    function getAllNodes(id, result = []) {
        if (!id) return [];
        const node = allNodes.filter(item => item.id == id)[0];
        if (node && node.parentId) {
            result.push({ title: node.title, id: node.id, type: node.children ? 'folder' : 'bookmark' });
            getAllNodes(node.parentId, result)
        }
        return result;
    }
    function sizeChange(size) {
        pageSize.value = size;
    }
    function pageChange(page) {
        currentPage.value = page < 1 ? 1 : (page > totalPage.value ? totalPage.value : page);
    }
    //监听添加书签事件
    chrome.bookmarks.onCreated.addListener((id, node) => {
        console.log("onCreate", id)
        chrome.bookmarks.getTree().then(result => {
            initNodes(expandTree(result), node.parentId);
        })
    })
    //监听删除书签事件
    chrome.bookmarks.onRemoved.addListener((id, removeNode) => {
        console.log("onRemove", id)
        chrome.bookmarks.getTree().then(result => {
            initNodes(expandTree(result), removeNode.parentId);
        })
    })
    return {
        currentTitle,
        currentNodes,
        currentTotal,
        currentPage,
        totalPage,
        pageSize,
        pageCache,
        parentId,
        pageNodes,
        total,
        allNodes,
        recentNodes,
        initNodes,
        getCurrentNodes,
        getNodeById,
        getNodeByTitle,
        getAllNodes,
        getTreeNodes,
        sizeChange,
        pageChange
    }
})

