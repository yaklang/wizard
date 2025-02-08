import type { TIcon } from '@/types';
import type { FC } from 'react';

const NetWorkIcon: FC<TIcon> = (props) => {
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
                d="M14 8C14 11.3137 11.3137 14 8 14M14 8C14 4.68629 11.3137 2 8 2M14 8H2M8 14C4.68629 14 2 11.3137 2 8M8 14C9.10457 14 10 11.3137 10 8C10 4.68629 9.10457 2 8 2M8 14C6.89543 14 6 11.3137 6 8C6 4.68629 6.89543 2 8 2M2 8C2 4.68629 4.68629 2 8 2"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default NetWorkIcon;
