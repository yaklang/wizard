import { FC } from 'react';

import { TIcon } from '@/types';

const TableDeleteOutlined: FC<TIcon> = (props) => (
    <svg
        width="28"
        height="16"
        viewBox="0 0 28 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="color-[#85899E] hover:color-[#F6544A] cursor-pointer"
        {...props}
    >
        <path
            d="M12.6665 4.66667L12.0883 12.7617C12.0385 13.4594 11.4579 14 10.7583 14H5.24133C4.54181 14 3.96122 13.4594 3.91138 12.7617L3.33317 4.66667M6.6665 7.33333V11.3333M9.33317 7.33333V11.3333M9.99984 4.66667V2.66667C9.99984 2.29848 9.70136 2 9.33317 2H6.6665C6.29831 2 5.99984 2.29848 5.99984 2.66667V4.66667M2.6665 4.66667H13.3332"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default TableDeleteOutlined;
