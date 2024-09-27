import { FC } from "react";
import Avatar from "../assets/compoments/Avatar.png";
import { CloseIcon } from "@/assets/compoments";
import useLoginStore from "./store/loginStore";
import { usePermissionsSlice } from "@/hooks";

/**
 *
 * @param collapse sider 展开收起状态
 * @returns
 */
const UserCard: FC<{ collapsed: boolean }> = ({ collapsed }) => {
  // 个人登录信息下拉菜单
  const { outLogin } = useLoginStore((state) => state);
  const { clearPower } = usePermissionsSlice();

  const handleOutLogin = () => {
    outLogin();
    clearPower();
  };

  return (
    <div
      className={`bg-[#FFFFFF] py-2 pl-2 pr-2 flex items-center gap-2 border-[1px solid #EAECF3] justify-between ${collapsed ? "flex-col h-20" : "flex-row h-18"}`}
    >
      <div>
        {/* 头像 */}
        <div className="flex items-center gap-1">
          <img
            src={Avatar}
            className="w-10 rounded-[50%]"
            style={{ border: "1px solid #F8F8F8" }}
          />
          {!collapsed && (
            <div>
              <div className="text-sm font-normal color-[#31343F]">
                桔子爱吃橘子
              </div>
              <div className="text-xs color-[#4A94F8] font-normal rounded-[8px] flex items-center py-[6px] bg-[#ECF4FE] justify-center">
                Super-admin
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="w-7 cursor-pointer" onClick={() => handleOutLogin()}>
        <CloseIcon />
      </div>
    </div>
  );
};

export { UserCard };
