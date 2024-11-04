import type { FC } from 'react';
import { useReducer } from 'react';

import { Modal as AntdModal } from 'antd';

import useModal from './useModal';
import type { ModalPropsType, ModalStateType } from './types';

// 弹窗组件的组件类型
type ModalType = FC<ModalPropsType> & { useModal: any };

const initialValue: ModalStateType = {
    open: false,
    btnLoading: false,
};
const reducer = (state: ModalStateType, payload: ModalStateType) => ({
    ...state,
    ...payload,
});

const WizardModal: ModalType = ({
    children,
    modal,
    onOk,
    onClose,
    ...props
}) => {
    const [state, dispatch] = useReducer(reducer, initialValue);
    const { open, btnLoading } = state;

    // 弹窗开启
    const handleOpen = (): void => {
        dispatch({ open: true });
    };
    // 弹窗关闭
    const handleClose = (): void => {
        dispatch({ ...initialValue });
        onClose?.();
    };

    // 点击确定
    const handleOk = async () => {
        if (onOk) {
            dispatch({ btnLoading: true });
            try {
                await onOk();
            } catch (e) {
                console.error(e);
            } finally {
                dispatch({ btnLoading: false });
            }
        }
    };

    modal.open = handleOpen;
    modal.close = handleClose;

    return (
        <AntdModal
            open={open}
            onCancel={handleClose}
            width={480}
            confirmLoading={btnLoading}
            onOk={handleOk}
            destroyOnClose
            {...props}
            maskClosable={false}
            styles={{
                header: {
                    background: '#F8F8F8',
                    borderRadius: '4px 4px 0 0',
                    padding: '10px 24px',
                    border: '1px solid #EAECF3',
                    display: 'flex',
                    alignItems: 'center',
                },
                footer: {
                    background: '#F8F8F8',
                    borderRadius: '4px 4px 0 0',
                    padding: '10px 24px',
                    border: '1px solid #EAECF3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                },
                content: {
                    padding: 0,
                    borderRadius: '4px',
                },
            }}
        >
            {children}
        </AntdModal>
    );
};

WizardModal.useModal = useModal;
export default WizardModal;
