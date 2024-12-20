import { TIcon } from '@/types';
import { FC } from 'react';

const LogIcon: FC<TIcon> = (props) => {
    return (
        <svg
            width="12"
            height="14"
            viewBox="0 0 12 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="color-[#85899E] hover:color-[#4A94F8] cursor-pointer"
            {...props}
        >
            <path
                d="M4.00016 2.33333H2.66683C1.93045 2.33333 1.3335 2.93029 1.3335 3.66667V11.6667C1.3335 12.403 1.93045 13 2.66683 13H9.3335C10.0699 13 10.6668 12.403 10.6668 11.6667V3.66667C10.6668 2.93029 10.0699 2.33333 9.3335 2.33333H8.00016M4.00016 2.33333C4.00016 3.06971 4.59712 3.66667 5.3335 3.66667H6.66683C7.40321 3.66667 8.00016 3.06971 8.00016 2.33333M4.00016 2.33333C4.00016 1.59695 4.59712 1 5.3335 1H6.66683C7.40321 1 8.00016 1.59695 8.00016 2.33333M6.00016 7H8.00016M6.00016 9.66667H8.00016M4.00016 7H4.00683M4.00016 9.66667H4.00683"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default LogIcon;
