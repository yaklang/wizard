import {
    forwardRef,
    ReactNode,
    useImperativeHandle,
    useEffect,
    useRef,
    useState,
} from 'react';

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

    const [width, setWidth] = useState<number>(800);
    const divRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (Array.isArray(blocks)) {
            // 获取报告内容wrapper宽度
            if (!divRef || !divRef.current) return;
            const div = divRef.current;
            setTimeout(() => setWidth(div.clientWidth), 100);
            for (let item of blocks) {
                if (item.type === 'json') {
                    if (
                        item.data.raw &&
                        item.data.raw !== 'null' &&
                        item.data.raw !== 'undefined' &&
                        item.data.title === '__raw__'
                    ) {
                        // const info = JSON.parse(item.data.raw);
                        // if (info.type === 'report-cover') {
                        //     const barGraphData: ReportJsonKindData['report-cover'] =
                        //         info;
                        //     break;
                        // }
                    }
                }
            }
        }
    }, []);

    return (
        <WizardDrawer drawer={drawer} width={'75%'} title={title} footer={null}>
            <ReportTemplate blocks={blocks} width={width} divRef={divRef} />
        </WizardDrawer>
    );
});

export { ScriptDetailButton };
