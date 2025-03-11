import type { TIcon } from '@/types';
import type { FC } from 'react';

const DragHandleIcon: FC<TIcon> = (props) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M7 6C5.89543 6 5 5.10457 5 4C5 2.89543 5.89543 2 7 2C8.10457 2 9 2.89543 9 4C9 5.10457 8.10457 6 7 6Z"
                fill="currentColor"
            />
            <path
                d="M7 12C5.89543 12 5 11.1046 5 10C5 8.89543 5.89543 8 7 8C8.10457 8 9 8.89543 9 10C9 11.1046 8.10457 12 7 12Z"
                fill="currentColor"
            />
            <path
                d="M7 18C5.89543 18 5 17.1046 5 16C5 14.8954 5.89543 14 7 14C8.10457 14 9 14.8954 9 16C9 17.1046 8.10457 18 7 18Z"
                fill="currentColor"
            />
            <path
                d="M13 6C11.8954 6 11 5.10457 11 4C11 2.89543 11.8954 2 13 2C14.1046 2 15 2.89543 15 4C15 5.10457 14.1046 6 13 6Z"
                fill="currentColor"
            />
            <path
                d="M13 12C11.8954 12 11 11.1046 11 10C11 8.89543 11.8954 8 13 8C14.1046 8 15 8.89543 15 10C15 11.1046 14.1046 12 13 12Z"
                fill="currentColor"
            />
            <path
                d="M13 18C11.8954 18 11 17.1046 11 16C11 14.8954 11.8954 14 13 14C14.1046 14 15 14.8954 15 16C15 17.1046 14.1046 18 13 18Z"
                fill="currentColor"
            />
        </svg>
    );
};

export { DragHandleIcon };
