import type { DrawerProps } from 'antd';
import type { ReactNode } from 'react';
import type { UseDrawerRefType } from './useDrawer';

// 抽屉组件props类型
export interface DrawerPropsType extends DrawerProps {
  children: ReactNode;
  drawer: UseDrawerRefType;
  noFooter?: boolean;
  cancelText?: string;
  okText?: string;
  onOk?: () => Promise<void>;
  onClose?: () => void;
}

// 抽屉组件 状态管理类型
export interface StateType {
  open?: boolean;
  btnLoading?: boolean;
}
