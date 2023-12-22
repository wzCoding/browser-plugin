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
    const currentNodes = ref(getFolder(defaultShowId).children);

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
    const total = allBookMarks.length;
    const currentTotal = computed(() => {
        return currentNodes.value.length;
    });
    const totalPage = computed(() => {
        return Math.ceil(currentTotal.value / pageSize.value);
    });
    function getFolder(id) {
        if (!id) return {};
        return allBookMarks.filter(item => item.id == id)[0];
    }
    function getTreeNodes() {
        const list = [];
        const result = [];
        allBookMarks.forEach(item => {
            if (item.children) {
                const node = {
                    title: item.title,
                    id: item.id, 
                }
                if (item.parentId) {
                    node.parentId = item.parentId;
                    list.push(node);
                }
            }
        });
        const root = list.filter(item => item.parentId == defaultId);
        const getTree = (item) => {
            const childrens = list.filter(child => child.parentId == item.id);
            if (childrens.length) {
                item.children = childrens;
                for (const child of childrens) {
                    getTree(child);
                }
            }
            if (item.parentId == defaultId) {
                result.push(item);
            }
        }
        for (const item of root) {
            getTree(item);
        }
        return result
    }
    function getNodeById(id) {
        if (!id) return {};
        return currentNodes.value.filter(item => item.id == id)[0];
    }
    function getNodeByTitle(title) {
        if (!title) return;
        return allBookMarks.filter(item => item.title.includes(title));
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
        const node = allBookMarks.filter(item => item.id == id)[0];
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
        getCurrentNodes,
        getNodeById,
        getNodeByTitle,
        getAllNodes,
        getTreeNodes,
        sizeChange,
        pageChange
    }
})