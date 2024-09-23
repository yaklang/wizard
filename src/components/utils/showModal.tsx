import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {ModalProps} from "antd/lib/modal";
import {Drawer, DrawerProps, Modal} from "antd";

export interface BaseModalProp extends ModalProps, React.ComponentProps<any> {

}

export const BaseModal: React.FC<BaseModalProp> = (props) => {
    const [visible, setVisible] = useState(true);

    return <Modal
        {...props}
        footer={false}
        visible={visible}
        onCancel={() => setVisible(false)}
        onOk={(e) => {
            if (props.onOk) props.onOk(e)
        }}
        closable={true} destroyOnClose={true}
        cancelButtonProps={{hidden: true}}
    />
};

export interface ShowModalProps extends BaseModalProp {
    content?: React.ReactNode;
}

export const showModal = (props: ShowModalProps) => {
    const div = document.createElement("div");
    document.body.appendChild(div)

    const render = (targetConfig: ShowModalProps) => {
        setTimeout(() => {
            ReactDOM.render(<>
                <BaseModal
                    {...targetConfig as ModalProps}
                    afterClose={() => {
                        const unmountResult = ReactDOM.unmountComponentAtNode(div);
                        if (unmountResult && div.parentNode) {
                            div.parentNode.removeChild(div);
                        }
                    }}
                >
                    {targetConfig.content}
                </BaseModal>
            </>, div)
        })
    }
    render(props);
    return {
        destroy: () => {
            const unmountResult = ReactDOM.unmountComponentAtNode(div);
            if (unmountResult && div.parentNode) {
                div.parentNode.removeChild(div)
            }
        }
    }
}

export interface BaseDrawerProp extends DrawerProps, React.ComponentProps<any> {
    afterClose?: (invisibleSetter?: (b: boolean) => any) => any
    afterVisible?: () => any
    afterInvisible?: () => any
}

export const BaseDrawer: React.FC<BaseDrawerProp> = (props) => {
    const [visible, setVisible] = useState(false);
    useEffect(()=>{
        setVisible(true)
    }, [])

    useEffect(() => {
        if (visible) {
            if (props.afterVisible) props.afterVisible();
        }
    }, [visible])

    const close = () => {
        setVisible(false)
        if (props.afterInvisible) props.afterInvisible();
        setTimeout(() => {
            if (props.afterClose) props.afterClose();
        }, 1000)
    }

    return <Drawer
        visible={visible}
        destroyOnClose={true}
        onClose={close}
        closable={true} width={"50%"} maskClosable={true}
        {...props}
    >

    </Drawer>
};

export interface ShowDrawerProps extends BaseDrawerProp {
    content?: React.ReactNode;
}

export const showDrawer = (props: ShowDrawerProps) => {
    const div = document.createElement("div");
    document.body.appendChild(div)

    const render = (targetConfig: ShowModalProps) => {
        setTimeout(() => {
            ReactDOM.render(<>
                <BaseDrawer
                    {...targetConfig as BaseDrawerProp}
                    afterClose={() => {
                        const unmountResult = ReactDOM.unmountComponentAtNode(div);
                        if (unmountResult && div.parentNode) {
                            div.parentNode.removeChild(div);
                        }
                    }}
                >
                    {targetConfig.content}
                </BaseDrawer>
            </>, div)
        })
    }
    render(props);
    return {
        destroy: () => {
            const unmountResult = ReactDOM.unmountComponentAtNode(div);
            if (unmountResult && div.parentNode) {
                div.parentNode.removeChild(div)
            }
        }
    }
}