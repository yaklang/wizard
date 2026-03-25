/**
 * @description 取消DebugPlugin
 */
export const apiCancelDebugPlugin: (token: string) => Promise<null> = (
    token,
) => {
    return new Promise((resolve) => {
        console.log('token:', token);
        resolve(null);
        // try {
        //     ipcRenderer
        //         .invoke(`cancel-DebugPlugin`, token)
        //         .then(() => {
        //             resolve(null);
        //         })
        //         .catch((e: any) => {
        //             yakitNotify('error', '取消本地插件执行出错:' + e);
        //             reject(e);
        //         });
        // } catch (error) {
        //     yakitNotify('error', '取消本地插件执行出错:' + error);
        //     reject(error);
        // }
    });
};
