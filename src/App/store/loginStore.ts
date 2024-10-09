// import { loginAsync, outLoginAsync } from "@/apis/login/login";
// import type { LoginRequest } from "@/apis/login/types";
import { login } from '@/apis/account';
import { create } from 'zustand';

interface LoginStore {
    userInfo: any;
    token: string;
    login: (param: any) => Promise<void>;
    outLogin: () => Promise<void>;
}

const useLoginStore = create<LoginStore>()((set) => ({
    userInfo: JSON.parse(String(localStorage.getItem('userInfo'))) || {},
    token: localStorage.getItem('token') || '',
    login: async (param) => {
        await login(param).then((res: any) => {
            if (res?.token) {
                // localStorage.setItem('userInfo', JSON.stringify(data));
                localStorage.setItem('token', res?.token);
            }

            set({
                // userInfo: { ...data },
                token: res?.token,
            });
        });
    },
    outLogin: async () => {
        // await outLoginAsync();
        localStorage.clear();
        set({ userInfo: {}, token: '' });
    },
}));

export default useLoginStore;
