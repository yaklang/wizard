import type { TIcon } from '@/types';
import type { FC } from 'react';

const PerformanceIcon: FC<TIcon> = (props) => {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="color-[#85899E] hover:color-[#4A94F8] cursor-pointer"
            {...props}
        >
            <path
                d="M4.66667 8.00033L6.66667 6.00033L8.66667 8.00033L11.3333 5.33366M5.33333 14.0003L8 11.3337L10.6667 14.0003M2 2.66699H14M2.66667 2.66699H13.3333V10.667C13.3333 11.0352 13.0349 11.3337 12.6667 11.3337H3.33333C2.96514 11.3337 2.66667 11.0352 2.66667 10.667V2.66699Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default PerformanceIcon;
