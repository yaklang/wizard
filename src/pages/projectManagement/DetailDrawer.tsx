import { Form, Input } from 'antd';
const { Item } = Form;

const DetailDrawer = () => {
    return (
        <div>
            <Item name="aaa" label="测试">
                <Input />
            </Item>
            <Item name={['bbb', 'ccc']} label="测试2">
                <Input />
            </Item>
            <Item name={['list', 0]} label="测试3">
                <Input />
            </Item>
            <Item name={['list', 1]} label="测试4">
                <Input />
            </Item>
        </div>
    );
};

export { DetailDrawer };
