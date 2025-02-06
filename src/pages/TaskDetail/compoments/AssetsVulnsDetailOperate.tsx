import type { FC } from 'react';
import { useRef } from 'react';

import { Button } from 'antd';

import { AssetsVulnsDetailModal } from './AssetsVulnsDetailModal';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';

const AssetsVulnsDetailOperate: FC<{
    render: any;
}> = ({ render }) => {
    const AssetsVulnsDetailRef = useRef<UseModalRefType>(null);
    return (
        <div>
            <Button
                className="p-0"
                type="link"
                onClick={() => AssetsVulnsDetailRef.current?.open(render)}
            >
                详情
            </Button>
            <AssetsVulnsDetailModal ref={AssetsVulnsDetailRef} title="详情" />
        </div>
    );
};

export { AssetsVulnsDetailOperate };
