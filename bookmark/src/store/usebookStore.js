import { ref } from "vue";
import { defineStore } from "pinia";
export const useBookStore = defineStore("bookmarks", () => {
    const bookList = ref();
    async function getBookList(result) {
        if (result) {
            bookList.value = result[0].children[0].children;
        } else {
            // const data = require('../../public/utils/data.json');
            // bookList.value = data[0].children[0].children;
            const data = await import('../../public/utils/data.json');
            bookList.value = data[0].children[0].children
        }
    }
    getBookList()
    //chrome.bookmarks.getTree(getBookList)
    return {
        bookList,
        getBookList
    }
})