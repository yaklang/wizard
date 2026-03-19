import type { FC } from 'react';
import NoLoginPermissionImage from '@/assets/compoments/NoLoginPermission.png';
import { Button, message } from 'antd';
import showErrorMessage from '@/utils/showErrorMessage';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { getLicense } from '@/apis/login';
import { resolveLicenseGateValue, shouldBypassLicense } from '@/utils/license';

const NoLoginPermission: FC = () => {
    const navigate = useNavigate();
    const bypassLicense = shouldBypassLicense();

    const headLogin = () => {
        if (bypassLicense) {
            navigate('/login', { replace: true });
            return;
        }
        runAsync();
    };

    const { runAsync, loading } = useRequest(
        async () => {
            const { data } = await getLicense();
            const { license } = data;
            return resolveLicenseGateValue(license);
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
            onError: () => {
                message.destroy();
                showErrorMessage('获取license失败，请联系系统管理员');
            },
        },
    );

    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <img src={NoLoginPermissionImage} className="w-80" />
            <div className="color-[#31343F] text-sm font-semibold">
                暂无访问权限
            </div>
            <div>登录后即可访问该页面</div>
            <Button
                color="primary"
                variant="outlined"
                onClick={headLogin}
                loading={loading}
            >
                {!loading ? '立即登录' : '获取权限中...'}
            </Button>
        </div>
    );
};

export default NoLoginPermission;
