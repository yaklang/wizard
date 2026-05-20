import type { FC } from 'react'
import Avatar from '../assets/compoments/Avatar.png'
import useLoginStore from './store/loginStore'

const UserCard: FC<{ collapsed: boolean; variant?: 'light' | 'dark' }> = ({ collapsed, variant = 'light' }) => {
  const { userInfo } = useLoginStore((state) => state)
  const isDark = variant === 'dark'

  return (
    <div
      className={`py-2 pl-2 pr-2 flex items-center gap-2 justify-between ${
        isDark
          ? 'wizard-sider-user-card bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)]'
          : 'bg-[#FFFFFF] border-[1px solid #EAECF3]'
      } ${collapsed ? 'flex-col h-20' : 'flex-row h-18'}`}
    >
      <div>
        <div className="flex items-center gap-1">
          <img
            src={Avatar}
            className="w-10 rounded-[50%]"
            style={{ border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #F8F8F8' }}
          />
          {!collapsed && (
            <div>
              <div className={`text-sm font-normal ${isDark ? 'text-white' : 'color-[#31343F]'}`}>
                {userInfo.username ?? '未知用户'}
              </div>
              <div
                className={`text-xs font-normal rounded-[8px] flex items-center py-[6px] px-1 justify-center ${
                  isDark ? 'text-white bg-[#1E5FD8]' : 'color-[#4A94F8] bg-[#ECF4FE]'
                }`}
              >
                {userInfo.roles?.join('') ?? '未获取到该权限'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { UserCard }
