import { Drawer } from "antd";

const DetailDrawer = () => {
    return (
        <Drawer
            open
            children={
                <div>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                    <p>Some contents...</p>
                </div>
            }
        />
    );
};

export { DetailDrawer };
