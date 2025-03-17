import type { TIcon } from '@/types';
import type { FC } from 'react';

const OutlineArrowBigUp: FC<TIcon> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        {...props}
    >
        <path
            d="M5.99998 14V6.66667H3.33331L7.99998 2L12.6666 6.66667H9.99998V14H5.99998Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export { OutlineArrowBigUp };
