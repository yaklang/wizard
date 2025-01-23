import type { ModalProps } from 'antd';
import type { ReactNode } from 'react';
import type { UseModalRefType } from './useModal';

// 弹窗类型声明
export interface ModalPropsType extends ModalProps {
    children: ReactNode;
    modal: UseModalRefType;
    onOk?: () => Promise<void>;
    onClose?: () => void;
}

// 弹窗 状态管理了类型
export interface ModalStateType {
    open?: boolean;
    btnLoading?: boolean;
}
