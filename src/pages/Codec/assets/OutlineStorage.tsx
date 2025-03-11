import type { TIcon } from '@/types';
import type { FC } from 'react';

const OutlineStorage: FC<TIcon> = (props) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <path
            d="M20.25 8.55938V19.5C20.25 19.6989 20.171 19.8897 20.0303 20.0303C19.8897 20.171 19.6989 20.25 19.5 20.25H4.5C4.30109 20.25 4.11032 20.171 3.96967 20.0303C3.82902 19.8897 3.75 19.6989 3.75 19.5V4.5C3.75 4.30109 3.82902 4.11033 3.96967 3.96967C4.11032 3.82902 4.30109 3.75 4.5 3.75H15.4406C15.538 3.74966 15.6345 3.76853 15.7246 3.80553C15.8147 3.84253 15.8966 3.89694 15.9656 3.96563L20.0344 8.03438C20.1031 8.10341 20.1575 8.18532 20.1945 8.27541C20.2315 8.36549 20.2503 8.46199 20.25 8.55938V8.55938Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M7.5 20.25V14.25C7.5 14.0511 7.57902 13.8603 7.71967 13.7197C7.86032 13.579 8.05109 13.5 8.25 13.5H15.75C15.9489 13.5 16.1397 13.579 16.2803 13.7197C16.421 13.8603 16.5 14.0511 16.5 14.25V20.25"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M14.25 6.75H9"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export { OutlineStorage };
