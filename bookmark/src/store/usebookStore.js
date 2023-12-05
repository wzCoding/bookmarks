import { reactive, ref } from "vue";
import { defineStore } from "pinia";
let bookmarks = []
function getFlatList(tree, result = []) {
    for (let i = 0; i < tree.length; i++) {
        result.push(tree[i]);
        if (tree[i].children) {
            getFlatList(tree[i].children, result);
        }
    }
    return result;
}
export const useBookStore = defineStore("bookmarks", () => {
    const currentMarks = ref(null);
    const parentId = ref(null);
    const selfId = ref(null);
    function getBookList(result) {
        if (result) {
            bookmarks.value = result[0].children[0].children;
        } else {
            const data = require('../../public/utils/data.json');
            currentMarks.value = data[0].children[0].children;
            bookmarks = getFlatList(data[0].children)
        }
    }
    function getTargetList(id) {
        const folder = bookmarks.filter(item => item.id == id);
        currentMarks.value = folder[0].children;
        parentId.value = folder[0].parentId;
        selfId.value = folder[0].id;
    }
    getBookList()
    return {
        currentMarks,
        parentId,
        selfId,
        getBookList,
        getTargetList
    }
})