import type { TIcon } from '@/types';
import type { FC } from 'react';

const OutlineArrowscollapse: FC<TIcon> = (props) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M15 5V9M15 9H19M15 9L20 4M9 5V9M9 9H5M9 9L4 4M15 19V15M15 15H19M15 15L20 20M9 19V15M9 15H5M9 15L4 20"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export { OutlineArrowscollapse };
