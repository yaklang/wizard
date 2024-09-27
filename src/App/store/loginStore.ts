// import { loginAsync, outLoginAsync } from "@/apis/login/login";
// import type { LoginRequest } from "@/apis/login/types";
import { create } from "zustand";

interface LoginStore {
  userInfo: any;
  token: string;
  login: (param: any) => Promise<void>;
  outLogin: () => Promise<void>;
}

const useLoginStore = create<LoginStore>()((set) => ({
  userInfo: JSON.parse(String(localStorage.getItem("userInfo"))) || {},
  token: localStorage.getItem("token") || "",
  login: async (param: any) => {
    // const { data } = await loginAsync(param);
    const data: any = {
      token: "aaa",
      userInfo: {
        name: 111,
      },
    };
    if (data) {
      localStorage.setItem("userInfo", JSON.stringify(data));
      localStorage.setItem("token", data.access_token);
    }

    set({ userInfo: { ...data }, token: data.token });
  },
  outLogin: async () => {
    // await outLoginAsync();
    localStorage.clear();
    set({ userInfo: {}, token: "" });
  },
}));

export default useLoginStore;
