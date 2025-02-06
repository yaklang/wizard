import type { FC } from 'react';

type TCopyOutlined = React.SVGProps<SVGSVGElement>;
const CopyOutlined: FC<TCopyOutlined> = (props) => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hover:color-[#1677ff] cursor-pointer color-[#85899E]"
        {...props}
    >
        <path
            d="M5.33317 4.66667V10C5.33317 10.7364 5.93012 11.3333 6.6665 11.3333H10.6665M5.33317 4.66667V3.33333C5.33317 2.59695 5.93012 2 6.6665 2H9.72369C9.90051 2 10.0701 2.07024 10.1951 2.19526L13.1379 5.13807C13.2629 5.2631 13.3332 5.43266 13.3332 5.60948V10C13.3332 10.7364 12.7362 11.3333 11.9998 11.3333H10.6665M5.33317 4.66667H4.6665C3.56193 4.66667 2.6665 5.5621 2.6665 6.66667V12.6667C2.6665 13.403 3.26346 14 3.99984 14H8.66651C9.77107 14 10.6665 13.1046 10.6665 12V11.3333"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default CopyOutlined;
