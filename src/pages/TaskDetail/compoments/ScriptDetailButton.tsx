import { forwardRef, ReactNode, useImperativeHandle } from 'react';

import { UseDrawerRefType } from '@/compoments/WizardDrawer/useDrawer';
import { WizardDrawer } from '@/compoments';
import { useSafeState } from 'ahooks';
import ReportTemplate from '@/compoments/ReportTemplate';
import { TReportTemplateProps } from '@/compoments/ReportTemplate/type';

const ScriptDetailButton = forwardRef<
    UseDrawerRefType,
    {
        title: string;
    }
>(({ title }, ref): ReactNode => {
    const [drawer] = WizardDrawer.useDrawer();

    const [blocks, setBlocks] = useSafeState<TReportTemplateProps['blocks']>(
        [],
    );

    useImperativeHandle(ref, () => ({
        async open(items) {
            setBlocks(items?.blocks);
            drawer.open();
        },
    }));

    return (
        <WizardDrawer drawer={drawer} width={'75%'} title={title} footer={null}>
            <ReportTemplate blocks={blocks} />
        </WizardDrawer>
    );
});

export { ScriptDetailButton };
