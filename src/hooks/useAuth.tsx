import permissionsSliceFn from '@/App/store/powerStore';

const useAuth = () => {
    const { permissionsSlice } = permissionsSliceFn();

    const includesPath = (path: string) => {
        return permissionsSlice.includes(path);
    };

    return [includesPath];
};
export default useAuth;
