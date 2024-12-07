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
import {
    ReportJsonKindData,
    TReportTemplateProps,
} from '@/compoments/ReportTemplate/type';
import { Button } from 'antd';
import html2pdf from 'html2pdf.js';
import { EmailMoadl } from './EmialModal';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';

export const opt = {
    margin: [10, 5, 10, 5],
    filename: 'report.pdf',
    image: { type: 'jpeg', quality: 0.95 },
    jsPDF: {
        format: 'a4',
    },
    html2canvas: {
        scale: 1.2,
    },
    pagebreak: {
        // 自动分页控制属性
        // mode: 'avoid-all',
        after: '#cover',
    },
};

const ScriptDetailButton = forwardRef<
    UseDrawerRefType,
    {
        title: string;
    }
>(({ title }, ref): ReactNode => {
    const [drawer] = WizardDrawer.useDrawer();
    const EmailModalRef = useRef<UseModalRefType>(null);

    const [cover, setCover] = useState<string>('');

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
                        const info = JSON.parse(item.data.raw);
                        if (info.type === 'report-cover') {
                            const barGraphData: ReportJsonKindData['report-cover'] =
                                info;
                            setCover(barGraphData.data);
                            break;
                        }
                    }
                }
            }
        }
    }, []);

    const downloadPdf = () => {
        if (!divRef || !divRef.current) return;
        const div = divRef.current;
        html2pdf().from(div).set(opt).save(); // 导出
    };

    return (
        <WizardDrawer drawer={drawer} width={'75%'} title={title} footer={null}>
            <div className="w-full flex justify-end">
                <Button
                    type="link"
                    onClick={(e) => {
                        e.preventDefault();
                        downloadPdf();
                    }}
                >
                    下载PDF报告
                </Button>
                <Button
                    type="link"
                    onClick={(e) => {
                        e.preventDefault();
                        EmailModalRef.current?.open();
                    }}
                >
                    发送报告到邮箱
                </Button>
            </div>
            <ReportTemplate blocks={blocks} width={width} divRef={divRef} />
            <EmailMoadl
                ref={EmailModalRef}
                title="发送报告到邮箱"
                cover={cover}
                divRef={divRef}
            />
        </WizardDrawer>
    );
});

export { ScriptDetailButton };
