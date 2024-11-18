import { Drawer as AntdDrawer, Button } from 'antd';
import type { FC } from 'react';
import { useReducer } from 'react';
import type { DrawerPropsType, StateType } from './types';
import useDrawer from './useDrawer';
import './index.scss';
import { CloseOutlined } from '@ant-design/icons';

type DrawerType = FC<Omit<DrawerPropsType, 'extra'>> & {
    useDrawer: any;
};

const initialValue: StateType = {
    open: false,
    btnLoading: false,
};
const reducer = (state: StateType, payload: StateType) => ({
    ...state,
    ...payload,
});

const WizardDrawer: DrawerType = ({
    children,
    drawer,
    onOk,
    onClose,
    noFooter,
    cancelText = '取消',
    okText = '确定',
    title = '新建抽屉',
    ...props
}) => {
    const [state, dispatch] = useReducer(reducer, initialValue);
    const { open, btnLoading } = state;

    // 打开抽屉
    const openDrawer = () => {
        dispatch({ open: true });
    };

    // 关闭抽屉
    const closeDrawer = () => {
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

    // 页脚
    const drawerFooter =
        props?.footer ??
        (noFooter ? null : (
            <div
                style={{
                    textAlign: 'left',
                }}
            >
                <Button
                    loading={btnLoading}
                    onClick={handleOk}
                    type="primary"
                    style={{ marginRight: 8 }}
                >
                    {okText}
                </Button>
                <Button onClick={closeDrawer} disabled={btnLoading}>
                    {cancelText}
                </Button>
            </div>
        ));

    // 打开抽屉
    drawer.open = openDrawer;

    // 关闭抽屉
    drawer.close = closeDrawer;

    return (
        <AntdDrawer
            className="drawer-container"
            open={open}
            onClose={closeDrawer}
            footer={drawerFooter}
            maskClosable={noFooter ? true : false}
            keyboard={false}
            closeIcon={false}
            width={props?.width || 600}
            destroyOnClose
            {...props}
            title={
                <div>
                    <CloseOutlined
                        className="color-[#85899E] mr-3"
                        onClick={closeDrawer}
                    />
                    <span className="color-[#31343F] font-sm font-semibold">
                        {title}
                    </span>
                </div>
            }
        >
            <div>{children}</div>
        </AntdDrawer>
    );
};

WizardDrawer.useDrawer = useDrawer;

export default WizardDrawer;
