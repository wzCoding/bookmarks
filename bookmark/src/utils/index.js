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
        callback && callback(tab);
    });
}
function getDate(date) {
    if (!date) return
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const add0 = (num) => { return num < 10 ? "0" + num : num }
    return `${year}/${add0(month)}/${add0(day)}`
}
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
export {
    debounce,
    setLocalCache,
    getLocalCache,
    getCurrentTab,
    getDate,
    getIconUrl
}