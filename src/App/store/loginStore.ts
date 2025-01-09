import { getLoginout, postLogin } from '@/apis/login';
import { PostRequestAuth } from '@/apis/login/types';
import { create } from 'zustand';

interface LoginStore {
    userInfo: Partial<PostRequestAuth['user_info']>;
    token?: string;
    login: (param: any) => Promise<void>;
    outLogin: () => Promise<void>;
}

const useLoginStore = create<LoginStore>()((set) => ({
    userInfo: JSON?.parse(String(localStorage?.getItem('userInfo'))) || {},
    token: localStorage.getItem('token') || undefined,
    login: async (param) => {
        await postLogin(param).then((res) => {
            const { data } = res;
            const { token, user_info } = data;
            if (token) {
                localStorage.setItem('userInfo', JSON.stringify(user_info));
                localStorage.setItem('token', token);
            }

            set({
                userInfo: { ...user_info },
                token: token,
            });
        });
    },
    outLogin: async () => {
        await getLoginout();
        localStorage.clear();
        set({ userInfo: {}, token: '' });
    },
}));

export default useLoginStore;
