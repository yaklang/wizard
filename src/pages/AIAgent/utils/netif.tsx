import type {
    YakURLKVPair,
    YakURLResource,
} from '@/pages/YakRunnerAuditCode/utils';
import { yakitFailed } from '@/utils/notification';

export interface YakURL {
    FromRaw: string;
    Schema: string;
    User: string;
    Pass: string;
    Location: string;
    Path: string;
    Query: YakURLKVPair[];
}
export interface RequestYakURLResponse {
    Page: number;
    PageSize: number;
    Total: number;
    Resources: YakURLResource[];
}

// const { ipcRenderer } = window.require('electron');

export const requestYakURLList = (
    url: YakURL,
    onResponse?: (response: RequestYakURLResponse) => any,
    onError?: (e: any) => any,
) => {
    url.Query = url.Query || [];
    url.Query.push({ Key: 'op', Value: 'list' });
    return ipcRenderer
        .invoke('RequestYakURL', {
            Url: url,
            Method: 'GET',
        })
        .then((rsp: RequestYakURLResponse) => {
            if (onResponse) {
                onResponse(rsp);
            }
            return rsp;
        })
        .catch((e: any) => {
            yakitFailed(`加载失败: ${e}`);
            if (onError) {
                onError(e);
            }
            throw e;
        });
};

export const loadFromYakURLRaw = (
    url: string,
    onResponse?: (response: RequestYakURLResponse) => any,
    onError?: (e: any) => any,
) => {
    return ipcRenderer
        .invoke('RequestYakURL', {
            Url: {
                FromRaw: url,
                Schema: '',
                User: '',
                Pass: '',
                Location: '',
                Path: '',
                Query: [],
            },
            Method: 'GET',
        })
        .then((rsp: RequestYakURLResponse) => {
            if (onResponse) {
                onResponse(rsp);
            }
            return rsp;
        })
        .catch((e: any) => {
            yakitFailed(`加载失败: ${e}`);
            if (onError) {
                onError(e);
            }
            throw e;
        });
};
