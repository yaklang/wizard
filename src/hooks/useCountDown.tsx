import { useState, useEffect } from 'react';

const COUNTDOWN_KEY = 'countdown';

const useCountDown = (
    initialTime: number,
): [number, () => void, () => void] => {
    const [countdown, setCountdown] = useState(() => {
        // 尝试从sessionStorage加载已存在的倒计时时间
        const storedCountdown = sessionStorage.getItem(COUNTDOWN_KEY);
        return Number(storedCountdown) || 0;
    });

    // 因为版本更新问题，找不到命名空间NodeJS 暂时使用any
    // let countdownInterval: NodeJS.Timeout | null = null;
    let countdownInterval: any | null = null;

    useEffect(() => {
        if (countdown > 0) {
            countdownInterval = setInterval(() => {
                setCountdown((prevCountdown) => prevCountdown - 1);
                sessionStorage.setItem(COUNTDOWN_KEY, String(countdown - 1)); // 持久化到sessionStorage
            }, 1000);

            // 当倒计时结束时清除定时器
            if (countdown < 1) {
                clearInterval(countdownInterval!);
                sessionStorage.removeItem(COUNTDOWN_KEY); // 倒计时结束后移除存储
            }
        } else {
            clearInterval(countdownInterval!); // 如果初始值为0，则直接清除可能存在的定时器
        }

        // 清理函数：在组件卸载时清除定时器
        return () => clearInterval(countdownInterval!);
    }, [countdown]);

    // 触发后开始倒计时
    const start = () => {
        setCountdown(initialTime);
    };

    // 清除定时器
    const clear = () => {
        clearInterval(countdownInterval!);
        sessionStorage.removeItem(COUNTDOWN_KEY);
        setCountdown(0);
    };

    return [countdown, start, clear];
};

export default useCountDown;
