import { TIcon } from '@/types';
import { FC } from 'react';

const TableHeaderFilter: FC<TIcon> = (props) => {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M2.6665 3C2.6665 2.44772 3.11422 2 3.6665 2H12.3332C12.8855 2 13.3332 2.44772 13.3332 3V4.25245C13.3332 4.51767 13.2278 4.77202 13.0403 4.95956L9.62606 8.37377C9.43853 8.56131 9.33317 8.81566 9.33317 9.08088V12L6.6665 14V9.08088C6.6665 8.81566 6.56115 8.56131 6.37361 8.37377L2.9594 4.95956C2.77186 4.77202 2.6665 4.51767 2.6665 4.25245V3Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default TableHeaderFilter;
