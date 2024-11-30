import { TIcon } from '@/types';
import { FC } from 'react';

const FileOutlinedIcon: FC<TIcon> = (props) => {
    return (
        <svg
            width="28"
            height="16"
            viewBox="0 0 28 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="color-[#85899E] hover:color-[#4A94F8] cursor-pointer"
            {...props}
        >
            <path
                d="M3.99992 7H7.99992M3.99992 9.66667H7.99992M9.33325 13H2.66659C1.93021 13 1.33325 12.403 1.33325 11.6667V2.33333C1.33325 1.59695 1.93021 1 2.66659 1H6.39044C6.56725 1 6.73682 1.07024 6.86185 1.19526L10.4713 4.80474C10.5963 4.92976 10.6666 5.09933 10.6666 5.27614V11.6667C10.6666 12.403 10.0696 13 9.33325 13Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export { FileOutlinedIcon };
