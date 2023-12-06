import { ref } from "vue";
import { defineStore } from "pinia";

let allBookMarks = [];
function getExpandList(tree, result = []) {
    for (let i = 0; i < tree.length; i++) {
        result.push(tree[i]);
        if (tree[i].children) {
            getExpandList(tree[i].children, result);
        }
    }
    return result;
}
function getAllList(result) {
    if (result) {
        allBookMarks = getExpandList(result);
    } else {
        const data = require('../../public/utils/data.json');
        allBookMarks = getExpandList(data);
    }
}

getAllList();
const defaultMarks = "书签栏";
const defaultMarksId = "1";
export const useBookStore = defineStore("bookmarks", () => {
    const parentId = ref(null);
    const currentId = ref(defaultMarksId);
    const currentTitle = ref(defaultMarks);
    const currentMarks = ref(null);
    function getCurrentMarks(id) {
        if (id) {
            currentId.value = id;
        }
        const folder = allBookMarks.filter(item => item.id == currentId.value)[0];
        currentTitle.value = folder.title == '' && folder.id == '0' ? "我的书签" : folder.title;
        currentMarks.value = folder.children;
        parentId.value = folder.parentId;
    }
    return {
        currentTitle,
        currentMarks,
        parentId,
        getCurrentMarks
    }
})