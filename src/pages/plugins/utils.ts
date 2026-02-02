export const apiDebugPlugin = async (req: any) => {
    return req;
};

export interface DebugPluginRequest {
    [key: string]: any;
}
