import type { FC } from 'react';
import NoLoginPermissionImage from '@/assets/compoments/NoLoginPermission.png';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getLicense } from '@/apis/login';

const NoLoginPermission: FC = () => {
    const navigate = useNavigate();

    const headLogin = () => {
        runAsync();
    };

    const { runAsync } = useRequest(
        async () => {
            const { data } = await getLicense();
            const { license } = data;
            return license?.length > 0 ? license : undefined;
        },
        {
            manual: true,
            onSuccess: (license) => {
                if (license) {
                    return navigate('/license', { state: { license } });
                } else {
                    navigate('/login', { replace: true });
                }
            },
        },
    );
    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <img src={NoLoginPermissionImage} className="w-80" />
            <div className="color-[#31343F] text-sm font-semibold">
                暂无访问权限
            </div>
            <div>登陆后即可访问该页面</div>
            <Button color="primary" variant="outlined" onClick={headLogin}>
                立即登陆
            </Button>
        </div>
    );
};

export default NoLoginPermission;
