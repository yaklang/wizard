import type { FC } from 'react';

import type { TIcon } from '@/types';

const TableFormOutlined: FC<TIcon> = (props) => (
    <svg
        width="29"
        height="16"
        viewBox="0 0 29 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="color-[#85899E] hover:color-[#4A94F8] cursor-pointer"
        {...props}
    >
        <path
            d="M7.33317 3.33334H3.99984C3.26346 3.33334 2.6665 3.93029 2.6665 4.66667V12C2.6665 12.7364 3.26346 13.3333 3.99984 13.3333H11.3332C12.0695 13.3333 12.6665 12.7364 12.6665 12V8.66667M11.7237 2.39052C12.2444 1.86983 13.0886 1.86983 13.6093 2.39052C14.13 2.91122 14.13 3.75544 13.6093 4.27614L7.88545 10H5.99984L5.99984 8.11438L11.7237 2.39052Z"
            // stroke="#85899E"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M28 2V14" stroke="#EAECF3" />
    </svg>
);

export default TableFormOutlined;
