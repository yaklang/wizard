import localforage from 'localforage';

export const getRemoteValue = (Key: string): Promise<any> => {
    return new Promise((resolve) => {
        resolve(localforage.getItem(Key));
    });
};

export const setRemoteValue = (Key: string, v: string) => {
    return localforage.setItem(Key, v);
};
