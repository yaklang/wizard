import permissionsSliceFn from '@/App/store/powerStore';
import { useEffect } from 'react';

interface UsePermissionsSliceProps {
    permissionsSlice: string[];
    clearPower: () => void;
}

const usePermissionsSlice = (): UsePermissionsSliceProps => {
    const { updatePower, permissionsSlice, clearPower } = permissionsSliceFn();

    const promiseUpdatePower = async () => {
        await updatePower();
    };

    useEffect(() => {
        promiseUpdatePower();
    }, []);

    return { permissionsSlice, clearPower };
};

export default usePermissionsSlice;
