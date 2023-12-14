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

//利用 Google Url 获取书签链接的图标
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

//获取当前active状态的浏览器页签
function getCurrentTab(callback) {
    let queryOptions = { active: true, lastFocusedWindow: true };
    chrome.tabs.query(queryOptions, ([tab]) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        callback && callback(tab);
    });
}

//修改bookmark
function updateBookMark(option, callback) {
    if (!option) return;
    const id = option.id;
    const details = {
        title: option.title ? option.title : "",
        url: option.url ? option.url : ""
    }
    chrome.bookmarks.update(id, details, (res) => {
        callback && callback(res);
    })
}

//创建bookmark
function createBookMark(option, callback) {
    if (!option) return;
    const id = option.id;
    const details = {
        index: option.index ? option.index : 0,
        parentId: option.parentId ? option.parentId : "1",
        title: option.title ? option.title : "",
        url: option.url ? option.url : "",
    }
    chrome.bookmarks.create(details, (res) => {
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
function moveBookMark(option, callback) {
    if (!option) return;
    const id = option.id;
    const details = {
        index: option.index ? option.index : 0,
        parentId: option.parentId ? option.parentId : "1",
    }
    chrome.bookmarks.move(id, details, (res) => {
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
    setLocalCache,
    getLocalCache,
    getCurrentTab,
    getDate,
    getIconUrl,
    updateBookMark,
    createBookMark,
    removeBookMark,
    moveBookMark,
    openTabs
}