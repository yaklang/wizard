import { FC } from 'react';
import { TIcon } from '@/types';

const DownloadOutlinedIcon: FC<TIcon> = (props) => {
    return (
        <svg
            width="28"
            height="16"
            viewBox="0 0 28 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="color-[#85899E] hover:color-[#4A94F8] cursor-pointer"
            {...props}
        >
            <path
                d="M2.66675 10.6668L2.66675 11.3335C2.66675 12.4381 3.56218 13.3335 4.66675 13.3335L11.3334 13.3335C12.438 13.3335 13.3334 12.4381 13.3334 11.3335L13.3334 10.6668M10.6667 8.00016L8.00008 10.6668M8.00008 10.6668L5.33341 8.00016M8.00008 10.6668L8.00008 2.66683"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export { DownloadOutlinedIcon };
