import type { TIcon } from '@/types';
import type { FC } from 'react';

const OmitIcon: FC<TIcon> = (props) => {
    return (
        <svg
            width="16"
            height="4"
            viewBox="0 0 12 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="color-[#85899E] hover:color-[#4A94F8] cursor-pointer"
            {...props}
        >
            <path
                d="M1.33317 1.99967H1.33984M5.99984 1.99967H6.0065M10.6665 1.99967H10.6732M1.99984 1.99967C1.99984 2.36786 1.70136 2.66634 1.33317 2.66634C0.964981 2.66634 0.666504 2.36786 0.666504 1.99967C0.666504 1.63148 0.964981 1.33301 1.33317 1.33301C1.70136 1.33301 1.99984 1.63148 1.99984 1.99967ZM6.6665 1.99967C6.6665 2.36786 6.36803 2.66634 5.99984 2.66634C5.63165 2.66634 5.33317 2.36786 5.33317 1.99967C5.33317 1.63148 5.63165 1.33301 5.99984 1.33301C6.36803 1.33301 6.6665 1.63148 6.6665 1.99967ZM11.3332 1.99967C11.3332 2.36786 11.0347 2.66634 10.6665 2.66634C10.2983 2.66634 9.99984 2.36786 9.99984 1.99967C9.99984 1.63148 10.2983 1.33301 10.6665 1.33301C11.0347 1.33301 11.3332 1.63148 11.3332 1.99967Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default OmitIcon;
