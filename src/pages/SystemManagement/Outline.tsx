import { FC } from 'react';

import { TIcon } from '@/types';

const Outline: FC<TIcon> = (props) => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="color-[#85899E] hover:color-[#4A94F8] cursor-pointer"
        {...props}
    >
        <path
            d="M0.666748 0.666992V4.00033H1.05443M11.2922 5.33366C10.9641 2.70278 8.71983 0.666992 6.00008 0.666992C3.76183 0.666992 1.84561 2.04577 1.05443 4.00033M1.05443 4.00033H4.00008M11.3334 11.3337V8.00033H10.9457M10.9457 8.00033C10.1546 9.95488 8.23833 11.3337 6.00008 11.3337C3.28034 11.3337 1.03608 9.29787 0.708011 6.66699M10.9457 8.00033H8.00008"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default Outline;
