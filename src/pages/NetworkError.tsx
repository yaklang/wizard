import NetworckImage from '@/assets/compoments/networckImage.png';
import { useNetworkStatus } from '@/hooks';
import { SyncOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const NetworkError = () => {
    const navigate = useNavigate();
    const { status } = useNetworkStatus();

    const headClean = () => {
        if (status) {
            navigate('/');
        } else {
            message.destroy();
            message.info('暂时未获取到网络连接, 请检查网络连接是否正常');
        }
    };
    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <img src={NetworckImage} />
            <div className="color-[#31343F] text-sm font-semibold">
                请检查网络连接
            </div>
            <div>联网后才可访问</div>
            <Button color="primary" variant="outlined" onClick={headClean}>
                <SyncOutlined />
                刷新页面
            </Button>
        </div>
    );
};

export { NetworkError };
