import { Tooltip as TooltipUoko } from 'antd';
import type { FC } from 'react';
import type { TooltipPropsWithOverlay } from 'antd/es/tooltip';

/**
 * 二次封装tooltip 兼容大屏
 * @param {Boolean} enable 是否启用tooltip
 * */

interface TooltipUokoProps extends TooltipPropsWithOverlay {
  enable?: boolean;
}

const Tooltip: FC<TooltipUokoProps> = (props) => {
  const { enable = true, children, ...reset } = props;
  return (
    <div>
      {enable ? (
        <TooltipUoko getPopupContainer={(e) => e.parentNode as HTMLElement} {...reset}>
          {children}
        </TooltipUoko>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};
export default Tooltip;
