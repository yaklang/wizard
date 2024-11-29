import Icon from '@ant-design/icons';
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon';
import React from 'react';

interface IconProps extends CustomIconComponentProps {
    onClick: (e: React.MouseEvent) => void;
}

const OutlineDocumenttext = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <path
            d="M5.99992 8H9.99992M5.99992 10.6667H9.99992M11.3333 14H4.66659C3.93021 14 3.33325 13.403 3.33325 12.6667V3.33333C3.33325 2.59695 3.93021 2 4.66659 2H8.39044C8.56725 2 8.73682 2.07024 8.86185 2.19526L12.4713 5.80474C12.5963 5.92976 12.6666 6.09933 12.6666 6.27614V12.6667C12.6666 13.403 12.0696 14 11.3333 14Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
/**
 * @description  Icon/Outline/Outlinedocument-text
 */
export const OutlineDocumenttextIcon = (props: Partial<IconProps>) => {
    return <Icon component={OutlineDocumenttext} {...props} />;
};

const OutlineDownload = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <path
            d="M2.66675 10.6668L2.66675 11.3335C2.66675 12.4381 3.56218 13.3335 4.66675 13.3335L11.3334 13.3335C12.438 13.3335 13.3334 12.4381 13.3334 11.3335L13.3334 10.6668M10.6667 8.00016L8.00008 10.6668M8.00008 10.6668L5.33341 8.00016M8.00008 10.6668L8.00008 2.66683"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
/**
 * @description  Icon/Outline/download
 */
export const OutlineDownloadIcon = (props: Partial<IconProps>) => {
    return <Icon component={OutlineDownload} {...props} />;
};

const OutlineTrash = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
    >
        <path
            d="M12.6667 4.66667L12.0885 12.7617C12.0387 13.4594 11.4581 14 10.7586 14H5.24157C4.54205 14 3.96147 13.4594 3.91163 12.7617L3.33341 4.66667M6.66675 7.33333V11.3333M9.33341 7.33333V11.3333M10.0001 4.66667V2.66667C10.0001 2.29848 9.7016 2 9.33341 2H6.66675C6.29856 2 6.00008 2.29848 6.00008 2.66667V4.66667M2.66675 4.66667H13.3334"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
/**
 * @description  Icon/Outline/trash
 */
export const OutlineTrashIcon = (props: Partial<IconProps>) => {
    return <Icon component={OutlineTrash} {...props} />;
};
