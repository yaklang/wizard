import type { FC } from 'react';

import EmptyImages from '@/assets/compoments/Empty.png';

const EmptyBox: FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <img src={EmptyImages} className="w-54" />
            <div className="font-semibold text-sm">暂无数据</div>
        </div>
    );
};

export default EmptyBox;
