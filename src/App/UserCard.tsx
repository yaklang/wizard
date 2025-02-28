import type { FC } from 'react';
import Avatar from '../assets/compoments/Avatar.png';
import { CloseIcon } from '@/assets/compoments';
import useLoginStore from './store/loginStore';
import { usePermissionsSlice } from '@/hooks';
import { Button, Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import { useSafeState } from 'ahooks';
import { useNavigate } from 'react-router-dom';

/**
 *
 * @param collapse sider 展开收起状态
 * @returns
 */
const UserCard: FC<{ collapsed: boolean }> = ({ collapsed }) => {
    const [open, setOpen] = useSafeState(false);
    const navigate = useNavigate();

    // 个人登录信息下拉菜单
    const { outLogin, userInfo } = useLoginStore((state) => state);
    const { clearPower } = usePermissionsSlice();

    const handleOutLogin = () => {
        outLogin();
        navigate('/login', { replace: true });
        clearPower();
    };

    return (
        <div
            className={`bg-[#FFFFFF] py-2 pl-2 pr-2 flex items-center gap-2 border-[1px solid #EAECF3] justify-between ${collapsed ? 'flex-col h-20' : 'flex-row h-18'}`}
        >
            <div>
                {/* 头像 */}
                <div className="flex items-center gap-1">
                    <img
                        src={Avatar}
                        className="w-10 rounded-[50%]"
                        style={{ border: '1px solid #F8F8F8' }}
                    />
                    {!collapsed && (
                        <div>
                            <div className="text-sm font-normal color-[#31343F]">
                                {userInfo.username ?? '未知用户'}
                            </div>
                            <div className="text-xs color-[#4A94F8] font-normal rounded-[8px] flex items-center py-[6px] px-1 bg-[#ECF4FE] justify-center">
                                {userInfo.roles?.join('') ?? '未获取到该权限'}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Popover
                open={open}
                onOpenChange={(open) => setOpen(open)}
                content={
                    <div className="flex justify-end gap-2">
                        <Button
                            color="default"
                            style={{
                                fontSize: '12px',
                            }}
                            onClick={() => setOpen(false)}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            style={{
                                fontSize: '12px',
                            }}
                            onClick={() => {
                                setOpen(false);
                                handleOutLogin();
                            }}
                        >
                            确定
                        </Button>
                    </div>
                }
                title={
                    <div>
                        <InfoCircleOutlined color="#faad14" />
                        <span className="ml-1 font-400"> 确定退出登录吗？</span>
                    </div>
                }
                trigger="click"
            >
                <div className="w-10 cursor-pointer px-2 cursor-pointer">
                    <CloseIcon />
                </div>
            </Popover>
        </div>
    );
};

export { UserCard };
