import type { FC } from 'react';

type TFormOutlined = React.SVGProps<SVGSVGElement>;

const FormOutlined: FC<TFormOutlined> = (props) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="hover:color-[#1677ff] cursor-pointer color-[#85899E]"
        {...props}
    >
        <path
            d="M11.3334 7.33334H8.00008C7.2637 7.33334 6.66675 7.93029 6.66675 8.66667V16C6.66675 16.7364 7.2637 17.3333 8.00008 17.3333H15.3334C16.0698 17.3333 16.6667 16.7364 16.6667 16V12.6667M15.7239 6.39052C16.2446 5.86983 17.0889 5.86983 17.6096 6.39052C18.1303 6.91122 18.1303 7.75544 17.6096 8.27614L11.8857 14H10.0001L10.0001 12.1144L15.7239 6.39052Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default FormOutlined;
