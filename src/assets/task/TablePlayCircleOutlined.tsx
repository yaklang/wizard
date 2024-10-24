import { FC } from 'react';

import { TIcon } from '@/types';

const PlayCircleOutlined: FC<TIcon> = (props) => (
    <svg
        width="29"
        height="16"
        viewBox="0 0 29 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="color-[#85899E] hover:color-[#4A94F8]"
        {...props}
    >
        <path
            d="M9.83462 7.4453L7.70313 6.02431C7.2601 5.72895 6.66667 6.04655 6.66667 6.57901V9.42099C6.66667 9.95345 7.2601 10.271 7.70313 9.97569L9.83462 8.5547C10.2304 8.29082 10.2304 7.70918 9.83462 7.4453Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M28 2V14" stroke="#EAECF3" />
    </svg>
);

export default PlayCircleOutlined;
