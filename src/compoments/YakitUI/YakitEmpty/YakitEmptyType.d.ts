import type { ReactNode } from 'react';
import type { EmptyProps } from 'antd';
export interface YakitEmptyProps extends EmptyProps {
    title?: string | null | ReactNode;
    descriptionReactNode?: ReactNode;
}
