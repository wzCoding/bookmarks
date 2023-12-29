//防抖函数
function debounce(func, delay = 1000) {
    let timer = null
    return function () {
        const that = this
        const args = arguments

        if (timer) {
            clearTimeout(timer) //清除已有的计时器，重新开始计时
        }

        timer = setTimeout(() => {
            func.apply(that, args)
        }, delay)
    }
}
//展开树结构
function expandTree(tree, result = []) {
    for (const item of tree) {
        result.push(item);
        if (item.children) {
            expandTree(item.children, result);
        }
    }
    return result;
}
//根据指定的key字段获取树结构
function getTreeByKey(list, rootId, key) {
    const nodes = [];
    const result = [];
    list.forEach(item => {
        if (item[key]) {
            const node = {
                title: item.title,
                id: item.id,
            }
            if (item.parentId) {
                node.parentId = item.parentId;
                nodes.push(node);
            }
        }
    });
    const root = nodes.filter(item => item.parentId == rootId);
    const getTree = (item) => {
        const childrens = nodes.filter(child => child.parentId == item.id);
        if (childrens.length) {
            item.children = childrens;
            for (const child of childrens) {
                getTree(child);
            }
        }
        if (item.parentId == rootId) {
            result.push(item);
        }
    }
    for (const item of root) {
        getTree(item);
    }
    return result
}
//设置localStorage缓存
function setLocalCache(key, data) {
    const cache = window.localStorage.getItem(key);
    if (!cache) {
        window.localStorage.setItem(key, JSON.stringify(data));
    } else {
        const parsedCache = JSON.parse(cache);
        const dataKey = Object.keys(data)[0];
        if (!parsedCache[dataKey] && String(data[dataKey]) !== "1") {
            parsedCache[dataKey] = data[dataKey];
            window.localStorage.setItem(key, JSON.stringify(parsedCache));
        }
    }
}
//获取localStorage缓存
function getLocalCache(key, id) {
    const cache = window.localStorage.getItem(key);
    if (cache) {
        const parsedCache = JSON.parse(cache);
        return parsedCache[id];
    } else {
        return "";
    }
}

//简单的日期格式化
function getDate(date) {
    if (!date) return
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const add0 = (num) => { return num < 10 ? "0" + num : num }
    return `${year}/${add0(month)}/${add0(day)}`
}

//利用 Google Url 获取书签链接的favicon
function getIconUrl(url, callback) {
    const iconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`
    const img = new Image();
    img.src = iconUrl
    img.onload = async function () {
        return Promise.resolve(this).then(res => {
            callback && callback(res)
        });
    }
    return iconUrl;
}
//利用chrome-extension Api直接获取书签链接的favicon
function faviconURL(u) {
    const url = new URL(chrome.runtime.getURL("/_favicon/"));
    url.searchParams.set("pageUrl", u);
    url.searchParams.set("size", "32");
    return url.toString();
}

//获取当前active状态的浏览器页签
function getCurrentTab(callback) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        callback && callback(tab);
    });
}

//修改bookmark
function updateBookMark(id, options, callback) {
    if (!options) return;
    chrome.bookmarks.update(id, options, (res) => {
        callback && callback(res);
    })
}

//创建bookmark
function createBookMark(options, callback) {
    if (!options) return;
    chrome.bookmarks.create(options, (res) => {
        callback && callback(res);
    })
}

//删除bookmark
function removeBookMark(id, callback) {
    if (!id) return;
    chrome.bookmarks.remove(id, (res) => {
        callback && callback(res);
    })
}

//移动bookmark
function moveBookMark(id, options, callback) {
    if (!options) return;
    chrome.bookmarks.move(id, options, (res) => {
        callback && callback(res);
    })
}

//根据target关键字来打开链接
function openTabs(option) {
    if (!option) return;
    const { type, url } = option;
    if (type === "_blank") {
        window.open(url, type, "noopener,noreferrer");
    } else if (type === "_window") {
        chrome.windows.create({ url: url, focused: true, state: "maximized" })
    } else {
        getCurrentTab((tab) => {
            chrome.tabs.update(tab.id, { url: url, active: true });
        })
    }
}
export {
    debounce,
    expandTree,
    getTreeByKey,
    setLocalCache,
    getLocalCache,
    getCurrentTab,
    getDate,
    getIconUrl,
    updateBookMark,
    createBookMark,
    removeBookMark,
    moveBookMark,
    openTabs,
    faviconURL
}