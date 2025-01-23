import { create } from 'zustand';

interface PermissionsSlice {
    permissionsSlice: Array<string>;
    updatePower: () => Promise<void>;
    clearPower: () => void;
}

const permissionsSliceFn = create<PermissionsSlice>((set) => ({
    permissionsSlice: [],
    updatePower: async () => {
        const data = [{ path: '1' }];
        set({ permissionsSlice: data.map((it) => it.path) });
    },
    clearPower: () => set({ permissionsSlice: [] }),
}));

export default permissionsSliceFn;
