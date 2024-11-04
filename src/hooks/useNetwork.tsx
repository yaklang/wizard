import { useEffect, useState } from 'react';

const useNetworkStatus = (): { status: boolean } => {
    const [isOnline, setIsOnline] = useState(window.navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { status: isOnline }; // 将 isOnline 包裹在数组中返回
};

export default useNetworkStatus;
