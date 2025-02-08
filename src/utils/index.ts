import type { RouteObjectRootMy } from '@/App/routers/routers';
import type { ReactNode } from 'react';
import type { RuleObject } from 'antd/lib/form';
import type { Dayjs } from 'dayjs';

// 计算表格总宽度
export function getColumnsWidth(columns: any[]) {
    if (!Array.isArray(columns)) {
        throw TypeError('columns 类型错误，期望为一个 array');
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
                typeof fields.label === 'function'
                    ? fields.label(item)
                    : item[fields.label ?? 'text'],
            value:
                typeof fields.value === 'function'
                    ? fields.value(item)
                    : item[fields.value ?? 'value'],
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
        return n.trim() === '';
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
        Object.prototype.toString.call(n) === '[object Number]' &&
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
    const isStrictNumber = isNumber(n) && n.toString().indexOf('.') === -1;
    if (strict) {
        return isStrictNumber;
    }
    return isStrictNumber || (isString(n) && /^-?\d+$/.test(n));
};

export const isString = (n: any) => {
    return Object.prototype.toString.call(n) === '[object String]';
};

export const isObject = (n: any) => {
    return Object.prototype.toString.call(n) === '[object Object]';
};

export const isArray = (n: any) => {
    return Array.isArray(n);
};

export const isFunction = (n: any) => {
    return Object.prototype.toString.call(n) === '[object Function]';
};

export const isPromise = (n: any) => {
    return n instanceof Promise;
};

// 文件保存
export function saveFile(file: Blob, fileName: string) {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(file);
    link.download = fileName ?? '未命名文件';
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
    type = 'height',
}: {
    container: HTMLDivElement | null;
    content: HTMLDivElement | null;
    type?: 'height' | 'width';
}): boolean | undefined => {
    if (!container || !content) return;

    let result = false;

    if (type === 'width') {
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

// 对比两个对象是否相同
const deepEqual = (
    pre: Record<any, any> = {},
    cur: Record<any, any> = {},
): boolean => {
    // 如果是同一个引用，直接相等
    if (pre === cur) return true;

    // 检查类型是否相同
    if (typeof pre !== typeof cur) return false;

    // 特殊情况处理：null、NaN
    if (pre === null || cur === null) return pre === cur;
    if (typeof pre !== 'object') return pre === cur; // 处理原始类型

    // 处理 NaN 的比较，NaN !== NaN
    if (Number.isNaN(pre) && Number.isNaN(cur)) return true;

    // 对象类型：数组、普通对象
    if (Array.isArray(pre)) {
        // 如果是数组，长度不同则不相等
        if (!Array.isArray(cur) || pre.length !== cur.length) return false;

        // 递归比较数组的每个元素
        for (let i = 0; i < pre.length; i++) {
            if (!deepEqual(pre[i], cur[i])) return false;
        }
        return true;
    }

    // 普通对象：获取键并递归比较键和值
    const keys1 = Object.keys(pre);
    const keys2 = Object.keys(cur);

    // 键的数量不一样，直接返回 false
    if (keys1.length !== keys2.length) return false;

    // 递归比较每个键的值
    for (let key of keys1) {
        if (!cur.hasOwnProperty(key) || !deepEqual(pre[key], cur[key])) {
            return false;
        }
    }

    return true;
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

interface ResultItem {
    key: string;
    label: string;
    icon?: ReactNode;
    keypath: string;
    onClick?: ({ key }: { key: string }) => void;
    children?: ResultItem[];
    hidden: boolean;
}

// routelist 节点key转换
const processMenu = (
    menus: RouteObjectRootMy[],
    navigate: (key: string) => void,
): ResultItem[] => {
    return menus.reduce<ResultItem[]>((acc, menu) => {
        const { path, name, icon, key, children } = menu;

        const result: ResultItem = {
            key: `/${path}`, // 根路径
            // label: !collapsed ? (name ?? '') : '',
            label: name ?? '',
            icon,
            keypath: key ?? '',
            hidden: false,
            onClick: ({ key }) => {
                navigate(key);
            },
        };

        if (children) {
            // 递归处理子菜单
            result.children = children
                .map((child: RouteObjectRootMy) => ({
                    key: `/${path}/${child.path}`, // 子路径
                    label: child.name ?? '', // 确保 child 的类型和 name 的可选性
                    icon: null,
                    keypath: child.key ?? '',
                    onClick: ({ key }: { key: string }) => {
                        navigate(key);
                    },
                    hidden: child?.hidden ?? false,
                }))
                .filter((it) => !it.hidden);
        }

        // 将结果推入累积数组
        return [...acc, result];
    }, []);
};

// 生成路径层级数组的函数
const getPathArray = (fullPath: string): string[] => {
    const segments = fullPath.split('/').filter(Boolean); // 过滤掉空字符串
    return segments.reduce<string[]>((acc, _, index) => {
        const path = '/' + segments.slice(0, index + 1).join('/');
        acc.push(path);
        return acc;
    }, []);
};

const findFullPath = (
    menu: RouteObjectRootMy,
    parentPath = '',
    depth = 1, // 控制递归深度
): string[] => {
    const currentPath = `${parentPath}/${menu.path}`; // 拼接路径

    if (menu.children && depth < 2) {
        // 限制递归到第二层
        return menu.children.reduce<string[]>((acc, child) => {
            const childPaths = findFullPath(child, currentPath, depth + 1); // 递归处理子菜单项，增加深度
            return acc.concat(childPaths);
        }, []);
    }

    return [currentPath];
};

const copyToClipboard = async (text: string): Promise<void> => {
    if (navigator?.clipboard?.writeText) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    } else {
        // Fallback: 使用输入框手动选中复制
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed'; // 避免页面滚动
        textArea.style.left = '-9999px'; // 隐藏
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback failed: ', err);
        }
        document.body.removeChild(textArea);
    }
};

// 根据路径筛选并生成相应的节点信息
const findPathNodes = (
    targetPath: string,
    routes: RouteObjectRootMy[],
    parentPath = '',
): { name: string; path: string }[] | null => {
    const targetPaths = targetPath.replace(/^\/+|\/+$/g, '');

    for (const route of routes) {
        // 拼接当前路径
        const currentPath = [parentPath, route.path]
            .filter(Boolean)
            .join('/')
            .replace(/^\/+|\/+$/g, '');

        // 正则处理动态参数匹配，例如 `detail/:id` 匹配 `detail/206`
        const pathRegex = new RegExp(
            `^${currentPath.replace(/:\w+/g, '[^/]+')}$`,
        );
        if (pathRegex.test(targetPaths)) {
            // 找到目标路径时，返回当前路径的所有祖先节点和目标节点
            return [{ name: route.name ?? '', path: currentPath }];
        }

        if (route.children) {
            const childResult = findPathNodes(
                targetPaths,
                route.children,
                currentPath,
            );
            if (childResult) {
                // 找到子节点路径，将当前节点添加到结果前
                return [
                    { name: route.name ?? '', path: currentPath },
                    ...childResult,
                ];
            }
        }
    }

    return null;
};

export const randomString = (length: number) => {
    let chars =
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = length; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

const generateUniqueId = (): string => {
    const timestamp = Date.now().toString(36); // 当前时间戳转为36进制
    const randomNum = Math.random().toString(36).substring(2, 8); // 生成随机数并转为36进制
    return `${timestamp}-${randomNum}`;
};

const createRules = ({
    required = false,
    requiredMessage = '该字段为必填项',
    validateStartTime,
}: {
    required?: boolean;
    requiredMessage?: string;
    validateStartTime?: (value: [Dayjs | null, Dayjs | null]) => any;
}): RuleObject[] => {
    const rules: RuleObject[] = [];

    // 必填校验
    if (required) {
        rules.push({
            required: true,
            message: requiredMessage,
        });
    }

    // 自定义校验：校验开始时间是否合理
    if (validateStartTime) {
        rules.push({
            validator: (_, value: [Dayjs | null, Dayjs | null]) => {
                const errorMessage = validateStartTime(value);
                return errorMessage
                    ? Promise.reject(new Error(errorMessage))
                    : Promise.resolve();
            },
        });
    }

    return rules;
};

export {
    createFlatTreeWithId,
    processMenu,
    getPathArray,
    findFullPath,
    deepEqual,
    findPathNodes,
    generateUniqueId,
    copyToClipboard,
    createRules,
};
