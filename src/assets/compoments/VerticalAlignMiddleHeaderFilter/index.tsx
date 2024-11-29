import { TIcon } from '@/types';
import { FC } from 'react';

const VerticalAlignMiddleHeaderFilter: FC<TIcon> = (props) => (
    <svg
        width="8"
        height="12"
        viewBox="0 0 8 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M1.3335 4.00016L4.00016 1.3335L6.66683 4.00016M6.66683 8.00016L4.00016 10.6668L1.3335 8.00016"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default VerticalAlignMiddleHeaderFilter;
