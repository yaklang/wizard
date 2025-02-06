import type { FC } from 'react';

type TCopyOutlined = React.SVGProps<SVGSVGElement>;
const CopyOutlined: FC<TCopyOutlined> = (props) => (
    <svg
        width="25"
        height="24"
        viewBox="0 0 25 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hover:color-[#1677ff] cursor-pointer color-[#85899E]"
        {...props}
    >
        <path
            d="M9.66667 8.66667V14C9.66667 14.7364 10.2636 15.3333 11 15.3333H15M9.66667 8.66667V7.33333C9.66667 6.59695 10.2636 6 11 6H14.0572C14.234 6 14.4036 6.07024 14.5286 6.19526L17.4714 9.13807C17.5964 9.2631 17.6667 9.43266 17.6667 9.60948V14C17.6667 14.7364 17.0697 15.3333 16.3333 15.3333H15M9.66667 8.66667H9C7.89543 8.66667 7 9.5621 7 10.6667V16.6667C7 17.403 7.59695 18 8.33333 18H13C14.1046 18 15 17.1046 15 16V15.3333"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default CopyOutlined;
