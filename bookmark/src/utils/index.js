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
function getLocalCache(key, id) {
    const cache = window.localStorage.getItem(key);
    if (cache) {
        const parsedCache = JSON.parse(cache);
        return parsedCache[id];
    } else {
        return "";
    }
}
function getCurrentTab(callback) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        // `tab` will either be a `tabs.Tab` instance or `undefined`.
        callback && callback(tab);
    });
}
export {
    debounce,
    setLocalCache,
    getLocalCache,
    getCurrentTab
}