import type { ReactNode } from 'react';
import { forwardRef, useImperativeHandle } from 'react';

import type { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { WizardDrawer } from '@/compoments';
import EchartsLine from '@/compoments/AntdCharts/EchartsLine';

const PerformanceTestingDrawer = forwardRef<UseDrawerRefType>(
    (_, ref): ReactNode => {
        const [drawer] = WizardDrawer.useDrawer();
        useImperativeHandle(ref, () => ({
            async open() {
                drawer.open();
            },
        }));
        return (
            <WizardDrawer
                footer={null}
                drawer={drawer}
                title="性能检测"
                width="75%"
            >
                <EchartsLine />
            </WizardDrawer>
        );
    },
);

export { PerformanceTestingDrawer };
