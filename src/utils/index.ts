import { RouteObjectRootMy } from "@/App/routers/routers";
import { ReactNode } from "react";

// 计算表格总宽度
export function getColumnsWidth(columns: any) {
    if (!Array.isArray(columns)) {
        throw TypeError("columns 类型错误，期望为一个 array");
    }
    if (!columns?.length) {
        return;
    }
    return columns?.reduce((perv = 0, current) => {
        return Number(perv?.width ?? perv) + Number(current?.width ?? 0);
    });
}

// 下拉字段转换为value&label
// 定义数据源项的接口或类型
interface DataSourceItem {
    [key: string]: any; // 如果没有具体的键值对类型，请使用any，如果有更具体结构请替换any
}
// 定义字段映射接口
interface FieldsMapping {
    label?: string | ((item: DataSourceItem) => string);
    value?: string | ((item: DataSourceItem) => string);
}

export const formatSelectOptions = (
    dataSource: DataSourceItem[] = [],
    fields: FieldsMapping = {},
): { label: string; value: string }[] => {
    try {
        return dataSource.map((item) => ({
            label:
                typeof fields.label === "function"
                    ? fields.label(item)
                    : item[fields.label ?? "text"],
            value:
                typeof fields.value === "function"
                    ? fields.value(item)
                    : item[fields.value ?? "value"],
        }));
    } catch (e) {
        console.error(e);
        return [];
    }
};

/**
 *  检查某个值是否是空的
 * @param {*} n 要检查的值
 * @returns [] | '' | {} | undefined | null 这些值均返回true
 */
export const isEmpty = (n: any): boolean => {
    if (n === undefined || n === null) {
        return true;
    } else if (isString(n)) {
        return n.trim() === "";
    } else if (isArray(n)) {
        return !n.length;
    } else if (isObject(n)) {
        return !Object.keys(n).length;
    }
    return false;
};

/**
 * 判断是否是数字
 * @param {Number|String} n  要判断的数
 * @param {Boolean} strict 默认为true,即严格模式:只能是Number类型， false则判断String类型是否也满足是数字的情况
 */
export const isNumber = (n: any, strict = true) => {
    const isStrictNumber =
        Object.prototype.toString.call(n) === "[object Number]" &&
        !Number.isNaN(n) &&
        Number.isFinite(n);
    if (strict) {
        return isStrictNumber;
    }
    return isStrictNumber || (isString(n) && /^-?\d+(\.\d+)?$/.test(n));
};

/**
 * 判断是否是整数
 * @param {Number|String} n  要判断的数
 * @param {Boolean} strict 默认为true,即严格模式:只能是Number类型， false则判断String类型是否也满足是整数的情况
 */
export const isInteger = (n: any, strict = true) => {
    const isStrictNumber = isNumber(n) && n.toString().indexOf(".") === -1;
    if (strict) {
        return isStrictNumber;
    }
    return isStrictNumber || (isString(n) && /^-?\d+$/.test(n));
};

export const isString = (n: any) => {
    return Object.prototype.toString.call(n) === "[object String]";
};

export const isObject = (n: any) => {
    return Object.prototype.toString.call(n) === "[object Object]";
};

export const isArray = (n: any) => {
    return Array.isArray(n);
};

export const isFunction = (n: any) => {
    return Object.prototype.toString.call(n) === "[object Function]";
};

export const isPromise = (n: any) => {
    return n instanceof Promise;
};

// 文件保存
export function saveFile(file: Blob, fileName: string) {
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(file);
    link.download = fileName ?? "未命名文件";
    link.click();
}

// 递归节点树
export const traverseTree = (tree: any[], callback: (arg0: any) => void) => {
    if (!tree || !Array.isArray(tree)) {
        return;
    }

    tree.forEach((node) => {
        callback(node);
        if (node.children && node.children.length) {
            traverseTree(node.childrenList, callback);
        }
    });
};

/**
 * 判断文字是否溢出
 * @param {ReactNode} container 容器
 * @param {ReactNode} content 容器内部内容区域，type为height的时候需要传入，来判断内容区域是否超出容器
 * @param {String} type width判断宽度，height判断高度  默认为height
 * */
export const isExceedHeightAndWidth = ({
    container,
    content,
    type = "height",
}: {
    container: HTMLDivElement | null;
    content: HTMLDivElement | null;
    type?: "height" | "width";
}): boolean | undefined => {
    if (!container || !content) return;

    let result = false;

    if (type === "width") {
        if (container.scrollWidth > container.clientWidth) {
            result = true;
        }
    } else {
        if (!container || !content) return;
        if (content.offsetHeight > container.offsetHeight) {
            result = true;
        }
    }

    return result;
};

// tree 打平获取所有id
const defaultTo = (defaultValue: any, value: any) => value ?? defaultValue;
const createFlatTreeWithId = (parentId: any) => (tree: any) =>
    [
        {
            parentId,
            ...tree,
        },
    ].concat(
        ...defaultTo([], tree.children).map(createFlatTreeWithId(tree.id)),
    );

type ResultItem = {
    key: string;
    label: string;
    icon?: ReactNode;
    keypath: string;
    onClick?: ({ key }: { key: string }) => void;
    children?: ResultItem[];
};

// routelist 节点key转换
const processMenu = (
    menus: RouteObjectRootMy[],
    collapsed: boolean,
    navigate: (key: string) => void,
): ResultItem[] => {
    return menus.reduce<ResultItem[]>((acc, menu) => {
        const { path, name, icon, key, children } = menu;

        const result: ResultItem = {
            key: `/${path}`, // 根路径
            label: !collapsed ? (name ?? "") : "",
            icon,
            keypath: key ?? "",
            onClick: ({ key }) => {
                navigate(key);
            },
        };

        if (children) {
            // 递归处理子菜单
            result.children = children.map((child) => ({
                key: `/${path}/${child.path}`, // 子路径
                label: child.name ?? "",
                icon: child.icon,
                keypath: child.key ?? "",
                onClick: ({ key }) => {
                    navigate(key);
                },
            }));
        }

        // 将结果推入累积数组
        const routesList = [...acc, result];
        return routesList;
    }, []);
};

// 生成路径层级数组的函数
const getPathArray = (fullPath: string): string[] => {
    const segments = fullPath.split("/").filter(Boolean); // 过滤掉空字符串
    return segments.reduce<string[]>((acc, _, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        acc.push(path);
        return acc;
    }, []);
};

const findFullPath = (
    menu: RouteObjectRootMy,
    parentPath: string = "",
): string[] => {
    const currentPath = `${parentPath}/${menu.path}`; // 拼接父路径和当前路径

    if (menu.children) {
        // 如果有子菜单，递归处理每个子菜单项
        return menu.children.reduce<string[]>((acc, child) => {
            const childPaths = findFullPath(child, currentPath); // 递归处理子菜单项
            return acc.concat(childPaths); // 将子菜单路径添加到结果数组中
        }, []);
    }

    // 如果没有子菜单，返回当前路径
    return [currentPath];
};

export { createFlatTreeWithId, processMenu, getPathArray, findFullPath };
