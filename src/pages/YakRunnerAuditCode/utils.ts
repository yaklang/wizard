import { getRemoteValue, setRemoteValue } from '@/utils/kv';
import type { RequestYakURLResponse, YakURLResource } from '../yakURLTree/data';
import {
    FileDefault,
    FileSuffix,
    FolderDefault,
} from '../yakRunner/FileTree/icon';
import type {
    AuditDetailItemProps,
    AuditYakUrlProps,
} from './AuditCode/AuditCodeType';

import emiter from '@/utils/eventBus/eventBus';
import { failed, yakitNotify } from '@/utils/notification';
import type {
    AreaInfoProps,
    OpenFileByPathProps,
    QuerySSARisksResponse,
    SSARisk,
    TabFileProps,
    YakRunnerHistoryProps,
} from './YakRunnerAuditCodeType';
import cloneDeep from 'lodash/cloneDeep';
import { randomString } from '@/utils/randomUtil';
import { Uint8ArrayToString } from '@/utils/str';
import type { Palm } from '@/gen/schema';
import type {
    FileDetailInfo,
    OptionalFileDetailInfo,
    Selection,
} from './RunnerTabs/RunnerTabsType';
import { v4 as uuidv4 } from 'uuid';
import type { FileNodeMapProps, FileNodeProps } from './FileTree/FileTreeType';
import { SeverityMapTag } from '../risks/YakitRiskTable/YakitRiskTable';
import type { CodeRangeProps } from './RightAuditDetail/RightAuditDetail';
import type {
    QuerySyntaxFlowScanTaskRequest,
    QuerySyntaxFlowScanTaskResponse,
} from '../yakRunnerCodeScan/CodeScanTaskListDrawer/CodeScanTaskListDrawer';
import { genDefaultPagination } from '../invoker/schema';
import type { APIFunc } from '@/apiUtils/type';
import type { JumpToAuditEditorProps } from './BottomEditorDetails/BottomEditorDetailsType';
const { ipcRenderer } = window.require('electron');

export const initFileTreeData = (
    list: RequestYakURLResponse,
    path?: string | null,
) => {
    return list.Resources.sort((a, b) => {
        // 将 ResourceType 为 'dir' 的对象排在前面
        if (a.ResourceType === 'dir' && b.ResourceType !== 'dir') {
            return -1; // a排在b前面
        } else if (a.ResourceType !== 'dir' && b.ResourceType === 'dir') {
            return 1; // b排在a前面
        } else {
            return 0; // 保持原有顺序
        }
    }).map((item) => {
        const isFile = !item.ResourceType;
        const isFolder = item.ResourceType === 'dir';
        const suffix =
            isFile && item.ResourceName.indexOf('.') > -1
                ? item.ResourceName.split('.').pop()
                : '';
        const isLeaf = isFile || !item.HaveChildrenNodes;
        return {
            parent: path || null,
            name: item.ResourceName,
            path: item.Path,
            isFolder: isFolder,
            icon: isFolder
                ? FolderDefault
                : suffix
                  ? FileSuffix[suffix] || FileDefault
                  : FileDefault,
            isLeaf,
        };
    });
};

const getLineFun = (info: YakURLResource) => {
    try {
        if (info.ResourceType === 'risk') {
            const result = info.Extra.find(
                (item) => item.Key === 'code_range',
            )?.Value;
            if (result) {
                const item: CodeRangeProps = JSON.parse(result);
                const { start_line } = item;
                return start_line;
            }
        }
        return undefined;
    } catch (error) {}
};

const initRiskOrRuleTreeData = (list: RequestYakURLResponse, path: string) => {
    return list.Resources.sort((a, b) => {
        // 将 ResourceType 为 'program'与'source' 的对象排在前面
        if (
            ['program', 'source'].includes(a.ResourceType) &&
            !['program', 'source'].includes(b.ResourceType)
        ) {
            return -1; // a排在b前面
        } else if (
            !['program', 'source'].includes(a.ResourceType) &&
            ['program', 'source'].includes(b.ResourceType)
        ) {
            return 1; // b排在a前面
        } else {
            return 0; // 保持原有顺序
        }
    }).map((item) => {
        const isFile = !item.HaveChildrenNodes;
        const isFolder = item.HaveChildrenNodes;
        let suffix =
            isFile && item.ResourceName.indexOf('.') > -1
                ? item.ResourceName.split('.').pop()
                : '';
        const count = item.Extra.find((item) => item.Key === 'count')?.Value;
        const name = item.ResourceName.split('/').pop() || '';
        const severity = item.Extra.find(
            (item) => item.Key === 'severity',
        )?.Value;
        const severityValue = SeverityMapTag.find((item) =>
            item.key.includes(severity || ''),
        )?.value;
        let folderIcon = FolderDefault;
        let description: string | undefined;
        let line: number | undefined;
        if (item.ResourceType === 'source') {
            folderIcon = FileSuffix[item.ResourceName.split('.').pop() || ''];
            description = path ? item.Path.replace(path, '') : item.Path;
        }
        if (item.ResourceType === 'function') {
            folderIcon = FileSuffix['function'];
        }
        if (item.ResourceType === 'risk') {
            line = getLineFun(item);
        }
        if (item.ResourceType === 'risk' && severityValue) {
            suffix = severityValue;
        }
        return {
            parent: path || null,
            name,
            path: item.Path,
            isFolder,
            icon: isFolder
                ? folderIcon
                : suffix
                  ? FileSuffix[suffix] || FileDefault
                  : FileDefault,
            isLeaf: isFile,
            count,
            description,
            line,
            data: item,
        };
    });
};

/**
 * @name 审计完整树获取
 */
export const grpcFetchAuditTree: (
    path: string,
) => Promise<{ res: RequestYakURLResponse; data: FileNodeMapProps[] }> = (
    path,
) => {
    return new Promise((resolve, reject) => {
        // ssadb path为/时 展示最近编译
        const params = {
            Method: 'GET',
            Url: {
                Schema: 'ssadb',
                Query: [{ Key: 'op', Value: 'list' }],
                Path: path,
            },
        };
        const fetchData = async () => {
            try {
                const res: RequestYakURLResponse = await ipcRenderer.invoke(
                    'RequestYakURL',
                    params,
                );
                const data: FileNodeMapProps[] = initFileTreeData(res, path);
                resolve({ res, data });
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        };
        fetchData();
    });
};

/**
 * @name 漏洞文件/规则汇总树获取
 */
export const grpcFetchRiskOrRuleTree: (
    path: string,
    Query: {
        program: string;
        type: 'risk' | 'file' | 'rule';
        search?: string;
        task_id?: string;
        result_id?: string;
        increment?: boolean;
    },
) => Promise<{ res: RequestYakURLResponse; data: FileNodeMapProps[] }> = (
    path,
    { program, type, search, task_id, result_id, increment },
) => {
    return new Promise((resolve, reject) => {
        // ssadb path为/时 展示最近编译
        const params = {
            Method: 'GET',
            Url: {
                Schema: 'ssarisk',
                Path: path,
                Query: [
                    {
                        Key: 'type',
                        Value: type,
                    },
                    {
                        Key: 'program',
                        Value: type !== 'risk' ? program : '',
                    },
                    {
                        Key: 'search',
                        Value: search,
                    },
                    {
                        Key: 'task_id',
                        Value: task_id,
                    },
                    {
                        Key: 'result_id',
                        Value: result_id,
                    },
                ],
            },
        };
        if (increment) {
            params.Url.Query.push({
                Key: 'increment',
                Value: 'true',
            });
        }
        const fetchData = async () => {
            try {
                const res: RequestYakURLResponse = await ipcRenderer.invoke(
                    'RequestYakURL',
                    params,
                );
                const data: FileNodeMapProps[] = initRiskOrRuleTreeData(
                    res,
                    path === '/' ? program : path,
                );
                resolve({ res, data });
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        };
        fetchData();
    });
};

/**
 * @name 漏洞文件/规则汇树筛选列表获取
 */
export const grpcFetchAuditCodeRiskOrRuleList: (
    Programs: string,
) => Promise<QuerySyntaxFlowScanTaskResponse> = (Programs) => {
    return new Promise((resolve, reject) => {
        const params: QuerySyntaxFlowScanTaskRequest = {
            Pagination: genDefaultPagination(100, 1),
            Filter: {
                Programs: [Programs],
                HaveRisk: true,
            },
        };
        const fetchData = async () => {
            try {
                const res: QuerySyntaxFlowScanTaskResponse =
                    await ipcRenderer.invoke('QuerySyntaxFlowScanTask', params);
                resolve(res);
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        };
        fetchData();
    });
};

/**
 * @name 代码审计
 */
export const loadAuditFromYakURLRaw = (
    params: AuditYakUrlProps,
    body?: Buffer,
    Page?: number,
    PageSize?: number,
): Promise<RequestYakURLResponse | null> => {
    return new Promise((resolve, reject) => {
        ipcRenderer
            .invoke('RequestYakURL', {
                Method: 'GET',
                Url: params,
                Body: body,
                Page,
                PageSize,
            })
            .then((rsp: RequestYakURLResponse) => {
                resolve(rsp);
            })
            .catch((e: unknown) => {
                reject(e instanceof Error ? e : new Error(String(e)));
            });
    });
};

const YakRunnerAuditOpenHistory = 'YakRunnerAuditOpenHistory';

/**
 * @name 更改Audit历史记录
 */
export const setAuditCodeHistory = (newHistory: YakRunnerHistoryProps) => {
    getRemoteValue(YakRunnerAuditOpenHistory).then((data) => {
        try {
            if (!data) {
                setRemoteValue(
                    YakRunnerAuditOpenHistory,
                    JSON.stringify([newHistory]),
                );
                emiter.emit(
                    'onCodeAuditRefreshAduitHistory',
                    JSON.stringify([newHistory]),
                );
                return;
            }
            const historyData: YakRunnerHistoryProps[] = JSON.parse(data);
            const newHistoryData: YakRunnerHistoryProps[] = [
                newHistory,
                ...historyData.filter((item) => item.path !== newHistory.path),
            ].slice(0, 10);
            setRemoteValue(
                YakRunnerAuditOpenHistory,
                JSON.stringify(newHistoryData),
            );
            emiter.emit(
                'onCodeAuditRefreshAduitHistory',
                JSON.stringify(newHistoryData),
            );
        } catch (error) {
            failed(`历史记录异常，重置历史 ${error}`);
            setRemoteValue(YakRunnerAuditOpenHistory, JSON.stringify([]));
        }
    });
};

/**
 * @name 获取Audit历史记录
 */
export const getAuditCodeHistory = (): Promise<YakRunnerHistoryProps[]> => {
    return new Promise((resolve) => {
        getRemoteValue(YakRunnerAuditOpenHistory).then((data) => {
            try {
                if (!data) {
                    resolve([]);
                    return;
                }
                const historyData: YakRunnerHistoryProps[] = JSON.parse(data);
                resolve(historyData);
            } catch (error) {
                resolve([]);
            }
        });
    });
};

/**
 * @name 判断分栏数据里是否存在审计代码框
 */
export const judgeAreaExistAuditPath = (
    areaInfo: AreaInfoProps[],
): Promise<string[]> => {
    return new Promise((resolve) => {
        const newAreaInfo: AreaInfoProps[] = cloneDeep(areaInfo);
        const hasPath: string[] = [];
        newAreaInfo.forEach((item) => {
            item.elements.forEach((itemIn) => {
                itemIn.files.forEach((file) => {
                    if (file.fileSourceType === 'audit') {
                        hasPath.push(file.path);
                    }
                });
            });
        });
        resolve(hasPath);
    });
};

/**
 * @name 删除分栏数据里多个节点的file数据并重新布局
 */
export const removeAuditCodeAreaFilesInfo = (
    areaInfo: AreaInfoProps[],
    removePath: string[],
) => {
    const buildAreaInfo = (infoArr: AreaInfoProps[]) => {
        let newAreaInfo: AreaInfoProps[] = cloneDeep(infoArr);
        // 移除elements中的files层
        newAreaInfo = newAreaInfo.map((item) => {
            const newElements = item.elements.filter(
                (itemIn) => itemIn.files.length > 0,
            );
            return {
                ...item,
                elements: newElements,
            };
        });

        // 移除elements层
        const resultAreaInfo = newAreaInfo.filter(
            (item) => item.elements.length > 0,
        );
        return resultAreaInfo;
    };

    const newAreaInfo: AreaInfoProps[] = cloneDeep(areaInfo);
    newAreaInfo.forEach((item, idx) => {
        item.elements.forEach((itemIn, idxin) => {
            const files = itemIn.files;
            if (files.some((file) => removePath.includes(file.path))) {
                newAreaInfo[idx].elements[idxin].files = files.filter(
                    (item) => !removePath.includes(item.path),
                );
            }
        });
    });
    return buildAreaInfo(newAreaInfo);
};

/**
 * @name 更改分栏数据里某个节点的isActive活动数据
 */
export const setAuditCodeAreaFileActive = (
    areaInfo: AreaInfoProps[],
    path: string,
) => {
    const updatedAreaInfo: AreaInfoProps[] = cloneDeep(areaInfo);
    updatedAreaInfo.forEach((item, index) => {
        item.elements.forEach((itemIn, indexIn) => {
            const files = itemIn.files;
            const fileIndex = files.findIndex((file) => file.path === path);

            if (fileIndex !== -1) {
                updatedAreaInfo[index].elements[indexIn].files = files.map(
                    (item) => ({
                        ...item,
                        isActive: false,
                    }),
                );
                updatedAreaInfo[index].elements[indexIn].files[
                    fileIndex
                ].isActive = true;
            }
        });
    });
    return updatedAreaInfo;
};

/**
 * @name 更新分栏数据里某个节点的file数据
 */
// 根据path更新指定内容
export const updateAuditCodeAreaFileInfo = (
    areaInfo: AreaInfoProps[],
    data: OptionalFileDetailInfo,
    path: string,
) => {
    const updatedAreaInfo: AreaInfoProps[] = cloneDeep(areaInfo);
    updatedAreaInfo.forEach((item, index) => {
        item.elements.forEach((itemIn, indexIn) => {
            const files = itemIn.files;
            files.forEach((file, fileIndex) => {
                if (file.path === path) {
                    updatedAreaInfo[index].elements[indexIn].files[fileIndex] =
                        {
                            ...files[fileIndex],
                            ...data,
                        };
                }
            });
        });
    });
    return updatedAreaInfo;
};

/**
 * @name 判断分栏数据里是否存在某个节点file数据
 */
export const judgeAuditCodeAreaExistFilePath = (
    areaInfo: AreaInfoProps[],
    path: string,
): Promise<FileDetailInfo | null> => {
    return new Promise((resolve) => {
        const newAreaInfo: AreaInfoProps[] = cloneDeep(areaInfo);
        newAreaInfo.forEach((item) => {
            item.elements.forEach((itemIn) => {
                itemIn.files.forEach((file) => {
                    if (file.path === path) {
                        resolve(file);
                    }
                });
            });
        });
        resolve(null);
    });
};

/**
 * @name 新增分栏数据里某个节点的file数据
 */
export const addAuditCodeAreaFileInfo = (
    areaInfo: AreaInfoProps[],
    info: FileDetailInfo,
    activeFile?: FileDetailInfo,
) => {
    let newAreaInfo: AreaInfoProps[] = cloneDeep(areaInfo);
    let newActiveFile: FileDetailInfo = info;
    try {
        // 如若存在激活项则向激活项后添加新增项并重新指定激活项目
        if (newAreaInfo.length > 0 && activeFile) {
            newAreaInfo.forEach((item, index) => {
                item.elements.forEach((itemIn, indexIn) => {
                    const files = itemIn.files;
                    const fileIndex = files.findIndex(
                        (file) => file.path === activeFile.path,
                    );

                    if (fileIndex !== -1) {
                        newAreaInfo[index].elements[indexIn].files = files.map(
                            (item) => ({
                                ...item,
                                isActive: false,
                            }),
                        );
                        newAreaInfo[index].elements[indexIn].files.splice(
                            fileIndex + 1,
                            0,
                            info,
                        );
                    }
                });
            });
        } else {
            if (newAreaInfo.length === 0) {
                const newElements: TabFileProps[] = [
                    {
                        id: uuidv4(),
                        files: [info],
                    },
                ];
                newAreaInfo = [{ elements: newElements }];
            } else {
                newAreaInfo[0].elements[0].files =
                    newAreaInfo[0].elements[0].files.map((item) => ({
                        ...item,
                        isActive: false,
                    }));
                newAreaInfo[0].elements[0].files = [
                    ...newAreaInfo[0].elements[0].files,
                    info,
                ];
            }
        }
        return {
            newAreaInfo,
            newActiveFile,
        };
    } catch (error) {
        return {
            newAreaInfo,
            newActiveFile,
        };
    }
};

/**
 * @name 删除分栏数据里某个节点的file数据
 */
export const removeAuditCodeAreaFileInfo = (
    areaInfo: AreaInfoProps[],
    info: FileDetailInfo,
) => {
    const newAreaInfo: AreaInfoProps[] = cloneDeep(areaInfo);
    let newActiveFile: FileDetailInfo | undefined;
    const activeFileArr: FileDetailInfo[] = [];

    const removeFileFromElements = (
        areaIndex: number,
        elementIndex: number,
        files: FileDetailInfo[],
        elements: TabFileProps[],
    ) => {
        if (elements.length > 1 && files.length === 1) {
            newAreaInfo[areaIndex].elements = elements.filter(
                (el) => !el.files.some((f) => f.path === info.path),
            );
        } else if (elements.length <= 1 && files.length === 1) {
            newAreaInfo.splice(areaIndex, 1);
        } else {
            newAreaInfo[areaIndex].elements[elementIndex].files = files.filter(
                (f) => f.path !== info.path,
            );

            if (info.isActive) {
                activatePreviousTab(
                    newAreaInfo[areaIndex].elements[elementIndex],
                    files,
                    info.path,
                );
            }
        }
    };

    newAreaInfo.forEach((item, idx) => {
        const activeFilesInArea = collectActiveFiles(item.elements);
        activeFileArr.push(...activeFilesInArea);

        item.elements.forEach((itemIn, idxin) => {
            const files = itemIn.files;
            if (files.some((file) => file.path === info.path)) {
                removeFileFromElements(idx, idxin, files, item.elements);
            }
        });
    });

    if (!newActiveFile && activeFileArr.length > 0) {
        const delIndex = activeFileArr.findIndex(
            (item) => item.path === info.path,
        );
        if (delIndex > -1) {
            newActiveFile = activeFileArr[delIndex - 1 < 0 ? 0 : delIndex - 1];
        }
    }
    return { newAreaInfo, newActiveFile };
};

const collectActiveFiles = (elements: TabFileProps[]): FileDetailInfo[] => {
    const activeFiles: FileDetailInfo[] = [];
    elements.forEach((itemIn) => {
        itemIn.files.forEach((file) => {
            if (file.isActive) activeFiles.push(file);
        });
    });
    return activeFiles;
};

const activatePreviousTab = (
    element: TabFileProps,
    files: FileDetailInfo[],
    closedPath: string,
) => {
    const infoIndex = files.findIndex((f) => f.path === closedPath);
    if (infoIndex !== -1) {
        const newIndex = infoIndex - 1 < 0 ? 0 : infoIndex - 1;
        if (element.files[newIndex]) {
            element.files[newIndex].isActive = true;
        }
    }
};

/**
 * @name 漏洞汇总
 */
export const onSyntaxRisk = ({
    ProgramName,
    CodeSourceUrl,
    RuntimeID,
}: any) => {
    return new Promise((resolve) => {
        ipcRenderer
            .invoke('QuerySSARisks', {
                Filter: {
                    ProgramName,
                    CodeSourceUrl,
                    RuntimeID,
                },
            })
            .then((res: QuerySSARisksResponse) => {
                const { Data } = res;
                resolve(Data);
            })
            .catch(() => {
                resolve([]);
            });
    });
};

/**
 * @name 注入漏洞汇总结果
 */
export const getAuditCodeDefaultActiveFile = async (
    info: FileDetailInfo,
    ProgramName: string[],
    CodeSourceUrl: string[],
    RuntimeID: string[],
) => {
    // if (info.syntaxCheck) {
    //     return info
    // }
    let newActiveFile = info;
    try {
        if (CodeSourceUrl.length > 0) {
            // 注入漏洞汇总结果
            const syntaxCheck = (await onSyntaxRisk({
                ProgramName,
                CodeSourceUrl,
                RuntimeID,
            })) as SSARisk[];
            if (syntaxCheck) {
                newActiveFile = { ...newActiveFile, syntaxCheck };
            }
        }
    } catch (error) {}
    return newActiveFile;
};

/**
 * @name 更改项是否包含激活展示文件，包含则取消激活
 */
export const isResetAuditCodeActiveFile = (
    files: FileDetailInfo[] | FileNodeProps[],
    activeFile: FileDetailInfo | undefined,
) => {
    let newActiveFile = activeFile;
    files.forEach((file) => {
        if (file.path === activeFile?.path) {
            newActiveFile = undefined;
        }
    });
    return newActiveFile;
};

/**
 * @name 文件树重命名
 */
export const grpcFetchAuditCodeRenameFileTree: (
    path: string,
    newName: string,
    parentPath: string | null,
) => Promise<FileNodeMapProps[]> = (path, newName, parentPath) => {
    return new Promise((resolve, reject) => {
        const rename = async () => {
            const params = {
                Method: 'POST',
                Url: {
                    Schema: 'file',
                    Query: [
                        { Key: 'op', Value: 'rename' },
                        {
                            Key: 'newname',
                            Value: newName,
                        },
                    ],
                    Path: path,
                },
            };
            try {
                const list: RequestYakURLResponse = await ipcRenderer.invoke(
                    'RequestYakURL',
                    params,
                );
                // console.log("文件树重命名", params, list)
                const data: FileNodeMapProps[] = initFileTreeData(
                    list,
                    parentPath,
                );
                resolve(data);
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        };
        rename();
    });
};

/** Extra找到code_range，根据其进行跳转到文件对应的位置 */
export const onJumpByCodeRange: APIFunc<AuditDetailItemProps, null> = (
    data: AuditDetailItemProps,
) => {
    return new Promise((resolve, reject) => {
        const jump = async () => {
            try {
                const arr = data.Extra.filter(
                    (item: { Key: string; Value: string }) =>
                        item.Key === 'code_range',
                );
                if (arr.length > 0) {
                    const item: CodeRangeProps = JSON.parse(arr[0].Value);
                    const {
                        url,
                        start_line,
                        start_column,
                        end_line,
                        end_column,
                    } = item;
                    const name = await getNameByPath(url);
                    // console.log("monaca跳转", item, name)
                    const highLightRange: Selection = {
                        startLineNumber: start_line,
                        startColumn: start_column,
                        endLineNumber: end_line,
                        endColumn: end_column,
                    };
                    const OpenFileByPathParams: OpenFileByPathProps = {
                        params: {
                            path: url,
                            name,
                            highLightRange,
                        },
                    };
                    emiter.emit(
                        'onCodeAuditOpenFileByPath',
                        JSON.stringify(OpenFileByPathParams),
                    );
                    // 纯跳转行号
                    setTimeout(() => {
                        const obj: JumpToAuditEditorProps = {
                            selections: highLightRange,
                            path: url,
                            isSelect: false,
                        };
                        emiter.emit(
                            'onCodeAuditJumpEditorDetail',
                            JSON.stringify(obj),
                        );
                    }, 100);
                    resolve(null);
                } else {
                    reject(new Error('未找到code_range字段,无法跳转'));
                }
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        };
        jump();
    });
};

/**
 * @name 根据文件path获取其内容
 */
export const getCodeByPath = (
    path: string,
    loadTreeType?: 'file' | 'audit',
): Promise<string> => {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getCodeByNode = async (_path: string) => {
        return Promise.resolve('');
    };

    return new Promise((resolve, reject) => {
        const getCode = async () => {
            try {
                let content = '';
                const token = randomString(60);
                ipcRenderer.invoke(
                    'ReadFile',
                    {
                        FilePath: path,
                        FileSystem:
                            loadTreeType === 'audit' ? 'ssadb' : 'local',
                    },
                    token,
                );
                ipcRenderer.on(
                    `${token}-data`,
                    (
                        _e: unknown,
                        result: { Data: Uint8Array; EOF: boolean },
                    ) => {
                        content += Uint8ArrayToString(result.Data);
                        if (result.EOF) {
                            resolve(content);
                        }
                    },
                );
                ipcRenderer.on(`${token}-error`, async () => {
                    // 此处在 ssadb 模式时不做node兼容处理
                    try {
                        const newContent = await getCodeByNode(path);
                        resolve(newContent);
                    } catch (error) {
                        failed(`无法获取该文件内容，请检查后后重试:  ${error}`);
                        reject(new Error('Failed to get code by node'));
                    }
                });
                ipcRenderer.on(`${token}-end`, () => {
                    ipcRenderer.removeAllListeners(`${token}-data`);
                    ipcRenderer.removeAllListeners(`${token}-error`);
                    ipcRenderer.removeAllListeners(`${token}-end`);
                });
            } catch (error) {}
        };
        getCode();
    });
};

/**
 * @name 根据文件path获取其大小并判断其是否为文本
 */
export const getCodeSizeByPath = (
    path: string,
    loadTreeType?: 'file' | 'audit',
): Promise<{ size: number; isPlainText: boolean }> => {
    return new Promise((resolve, reject) => {
        const getSize = async () => {
            const params = {
                Method: 'GET',
                Url: {
                    Schema: loadTreeType === 'audit' ? 'ssadb' : 'file',
                    Path: path,
                    Query: [{ Key: 'detectPlainText', Value: 'true' }],
                },
            };
            try {
                const list: RequestYakURLResponse = await ipcRenderer.invoke(
                    'RequestYakURL',
                    params,
                );
                const size = parseInt(String(list.Resources[0].Size), 10);
                let isPlainText = true;
                list.Resources[0].Extra.forEach(
                    (item: { Key: string; Value: string }) => {
                        if (
                            item.Key === 'IsPlainText' &&
                            item.Value === 'false'
                        ) {
                            isPlainText = false;
                        }
                    },
                );
                resolve({
                    size,
                    isPlainText,
                });
            } catch (error) {
                reject(
                    error instanceof Error ? error : new Error(String(error)),
                );
            }
        };
        getSize();
    });
};

/**
 * @name 获取路径上的(文件/文件夹)名（兼容多系统）
 */
export const getNameByPath = (filePath: string): Promise<string> => {
    return new Promise((resolve) => {
        ipcRenderer
            .invoke('pathFileName', {
                filePath,
            })
            .then((currentName: string) => {
                resolve(currentName);
            })
            .catch(() => {
                resolve('');
            });
    });
};

/**
 * @name 获取上一级的路径（兼容多系统）
 */
export const getPathParent = (filePath: string): Promise<string> => {
    return new Promise((resolve) => {
        ipcRenderer
            .invoke('pathParent', {
                filePath,
            })
            .then((currentPath: string) => {
                resolve(currentPath);
            })
            .catch(() => {
                resolve('');
            });
    });
};

interface FetchLocalPluginDetail {
    Name: string;
    UUID?: string;
}
/** @name 通过名字(必填)和UUID(选填)查询本地插件详情信息 */
export const grpcFetchLocalPluginDetail: APIFunc<
    FetchLocalPluginDetail,
    Palm.YakScript
> = (params: FetchLocalPluginDetail, hiddenError?: boolean) => {
    return new Promise((resolve, reject) => {
        const { Name, UUID } = params;
        if (!Name) {
            if (!hiddenError) yakitNotify('error', '查询插件名不能为空');
            reject(new Error('查询插件名不能为空'));
            return;
        }

        ipcRenderer
            .invoke('GetYakScriptByName', {
                UUID: UUID || undefined,
                Name: Name,
            })
            .then(resolve)
            .catch((e: unknown) => {
                if (!hiddenError)
                    yakitNotify('error', '查询本地插件详情失败:' + e);
                reject(e);
            });
    });
};

export interface QuerySyntaxFlowResultRequest {
    Pagination: any;
    Filter: any;
}

/** 获取审计结果 */
export const apiFetchQuerySyntaxFlowResult: (
    params: QuerySyntaxFlowResultRequest,
) => Promise<any> = (params) => {
    return new Promise((resolve, reject) => {
        const queryParams: QuerySyntaxFlowResultRequest = {
            ...params,
        };
        ipcRenderer
            .invoke('QuerySyntaxFlowResult', queryParams)
            .then((res: any) => {
                resolve(res);
            })
            .catch((e: unknown) => {
                reject(e);
                yakitNotify('error', '获取审计结果：' + e);
            });
    });
};

export interface SSARiskDisposalData {
    Id: number;
    Status: string;
    Comment: string;
    CreatedAt: number;
    UpdatedAt: number;
    RiskId: number;
    TaskName: string;
}

export interface GetSSARiskDisposalResponse {
    Data: SSARiskDisposalData[];
}

export const apiGetSSARiskDisposal: (params: {
    RiskId?: number;
    RiskHash?: string;
}) => Promise<GetSSARiskDisposalResponse> = (params) => {
    return new Promise((resolve, reject) => {
        ipcRenderer
            .invoke('GetSSARiskDisposal', params)
            .then(resolve)
            .catch((e: unknown) => {
                yakitNotify('error', `获取失败: ${e}`);
                reject(e);
            });
    });
};

export interface DbOperateMessage {
    // 表名 数据源
    TableName: string;
    // 操作 (增删改查)
    Operation: string;
    // 影响行数
    EffectRows: string;
    // 额外信息
    ExtraMessage: string;
}

export interface DeleteSSARiskDisposalsResponse {
    Message: DbOperateMessage;
}

export interface SSARiskDisposalsFilter {
    ID?: number[];
    Status?: string[];
    RiskId?: number[];
    Search?: string;
}

export interface DeleteSSARiskDisposalsRequest {
    Filter: SSARiskDisposalsFilter;
}

export const apiDeleteSSARiskDisposals: (
    params: DeleteSSARiskDisposalsRequest,
) => Promise<DeleteSSARiskDisposalsResponse> = (params) => {
    return new Promise((resolve, reject) => {
        ipcRenderer
            .invoke('DeleteSSARiskDisposals', params)
            .then(resolve)
            .catch((e: any) => {
                yakitNotify('error', `删除失败: ${e}`);
                reject(e);
            });
    });
};

export interface CreateSSARiskDisposalsRequest {
    RiskIds: number[];
    Status: string;
    Comment: string;
}

/** CreateSSARiskDisposals */
export const apiCreateSSARiskDisposals: (
    params: CreateSSARiskDisposalsRequest,
) => Promise<null> = (params) => {
    return new Promise((resolve, reject) => {
        ipcRenderer
            .invoke('CreateSSARiskDisposals', params)
            .then(resolve)
            .catch((e: any) => {
                yakitNotify('error', `设置失败: ${e}`);
                reject(e);
            });
    });
};

/**
 * @name 编辑器代码类型判断
 */
export const monacaLanguageType = (suffix?: string) => {
    switch ((suffix || '').toLowerCase()) {
        case 'yak':
            return 'yak';
        case 'sf':
            return 'syntaxflow';
        case 'json':
            return 'json';
        case 'html':
        case 'htm':
            return 'html';
        case 'css':
            return 'css';
        case 'md':
        case 'markdown':
            return 'markdown';
        case 'svg':
        case 'xml':
            return 'xml';
        case 'yml':
        case 'yaml':
            return 'yaml';
        case 'sh':
        case 'shell':
        case 'bash':
            return 'shell';
        case 'cmd':
        case 'bat':
            return 'bat';
        case 'ini':
            return 'ini';
        case 'sql':
            return 'sql';
        case 'dockerfile':
            return 'dockerfile';
        case 'js':
            return 'javascript';
        case 'java':
            return 'java';
        case 'go':
            return 'go';
        case 'php':
            return 'php';
        case 'c':
            return 'c';
        case 'cpp':
        case 'cc':
        case 'cxx':
        case 'c++':
            return 'cpp';
        case 'txt':
            return 'plaintext';
        default:
            return undefined;
    }
};
