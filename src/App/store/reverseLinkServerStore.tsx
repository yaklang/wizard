import { create } from 'zustand';

interface ServerParams {
    address: string;
    port: number;
    secret: string;
    Token?: string;
}

interface ReverseLinkServerStoreProps {
    isRemote: boolean;
    remoteAddress: string;
    secret: string;
    reversePort: number;
    Token?: string;
    isConnected: boolean;
    lastParam?: ServerParams;
    starReverseServer: (param: ServerParams) => Promise<void>;
    closeReverseServer: () => Promise<void>;
    tryRestoreConnection: () => Promise<void>;
}

const reverseLinkServerStore = create<ReverseLinkServerStoreProps>()(
    (set, get) => ({
        isRemote: false,
        remoteAddress: '',
        secret: '',
        reversePort: 0,
        Token: undefined,
        isConnected: false,
        lastParam: undefined,

        starReverseServer: async (param) => {
            const { address, port, secret, Token } = param;
            try {
                set({
                    isConnected: true,
                    remoteAddress: address,
                    reversePort: port,
                    secret,
                    isRemote: true,
                    Token,
                    lastParam: param,
                });
            } catch (error) {
                console.error('连接失败', error);
                set({ isConnected: false });
            }
        },

        closeReverseServer: async () => {
            try {
                set({
                    isConnected: false,
                    isRemote: false,
                    remoteAddress: '',
                    reversePort: 0,
                    Token: undefined,
                    secret: '',
                    lastParam: undefined,
                });
            } catch (error) {
                console.error('断开失败', error);
            }
        },

        tryRestoreConnection: async () => {
            const lastParam = get().lastParam;
            if (lastParam && !get().isConnected) {
                await get().starReverseServer(lastParam);
            }
        },
    }),
);

export default reverseLinkServerStore;
