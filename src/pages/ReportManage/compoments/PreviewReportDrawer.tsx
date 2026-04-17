import { ExportButton, WizardDrawer } from '@/compoments';
import ReportTemplate from '@/compoments/ReportTemplate';
import type {
    TReportTemplateProps,
    ReportJsonKindData,
} from '@/compoments/ReportTemplate/type';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { EmailMoadl } from '@/pages/TaskDetail/compoments/EmialModal';
import { useSafeState } from 'ahooks';
import { Button } from 'antd';
import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import html2pdf from 'html2pdf.js';
import { opt } from '@/pages/TaskDetail/compoments/ScriptDetailButton';
import { YakitDropdownMenu } from '@/compoments/yakitUI/YakitDropdownMenu/YakitDropdownMenu';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import htmlDocx from 'vite-html-docx';

const PreviewReportDrawer = forwardRef<
    UseModalRefType,
    {
        title: string;
    }
>(({ title }, ref) => {
    const [drawer] = WizardDrawer.useDrawer();

    const [width, setWidth] = useState<number>(800);
    const [report_id, setReportId] = useState<string>('');
    const divRef = useRef<HTMLDivElement>(null);

    const EmailModalRef = useRef<UseModalRefType>(null);

    const [cover, setCover] = useState<string>('');

    const [blocks, setBlocks] = useSafeState<TReportTemplateProps['blocks']>(
        [],
    );
    const reportTitleRef = useRef('');

    useImperativeHandle(ref, () => ({
        open(block, report_title, report_id) {
            drawer.open();
            setBlocks(block);
            setReportId(report_id);
            reportTitleRef.current = report_title;
        },
    }));

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

        // 商业美化：PDF 生成时的额外配置
        const printOptions = {
            ...opt(reportTitleRef.current),
            html2canvas: {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1200, // 保持固定宽度以优化排版
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };

        html2pdf().from(div).set(printOptions).save();
    };

    const [wordDownloadLoading, setWordDownloadLoading] =
        useState<boolean>(false);
    const isEchartsToImg = useRef<boolean>(true);

    // 下载Word
    const downloadWord = () => {
        if (!divRef || !divRef.current) return;
        setWordDownloadLoading(true);
        // 此处定时器为了确保已处理其余任务
        setTimeout(() => {
            exportToWord();
        }, 300);
    };

    // 下载报告
    const exportToWord = async () => {
        try {
            if (!divRef || !divRef.current) return;
            const contentHTML = divRef.current;
            if (isEchartsToImg.current) {
                isEchartsToImg.current = false;
                // 使用html2canvas将ECharts图表转换为图像
                const echartsElements = contentHTML.querySelectorAll(
                    '[data-type="echarts-box"]',
                );
                const promises = Array.from(echartsElements).map(
                    async (element) => {
                        // @ts-ignore
                        const echartType: string =
                            element.getAttribute('echart-type');
                        let options = {};
                        // 适配各种图表
                        if (echartType === 'vertical-bar') {
                            options = {
                                scale: 1,
                                windowWidth: 1000,
                                x: 150,
                                y: 0,
                            };
                        } else if (echartType === 'hollow-pie') {
                            options = { scale: 1, windowWidth: 1000 };
                        } else if (echartType === 'stacked-vertical-bar') {
                            options = {
                                scale: 1,
                                windowWidth: 1000,
                                x: 150,
                                y: 0,
                            };
                        } else if (echartType === 'multi-pie') {
                            options = { scale: 0.8, windowWidth: 1200 };
                        } else if (echartType === 'nightingle-rose') {
                            options = {
                                scale: 1,
                                windowWidth: 1000,
                                x: 150,
                                y: 0,
                                height: 400,
                            };
                        } else if (echartType === 'e-chart') {
                            options = { scale: 1, windowWidth: 1000 };
                        }

                        const canvas = await html2canvas(
                            element as HTMLElement,
                            options,
                        );
                        return canvas.toDataURL('image/jpeg');
                    },
                );

                const echartsImages = await Promise.all(promises);

                // 将图像插入到contentHTML中
                echartsImages.forEach((imageDataUrl, index) => {
                    const img = document.createElement('img');
                    img.src = imageDataUrl;
                    img.style.display = 'none';
                    echartsElements[index].appendChild(img);
                });
            }
            // word报告不要附录 table添加边框 移除南丁格尔玫瑰图点击详情(图像中已含)
            let wordStr: string = contentHTML.outerHTML;
            if (wordStr.includes('附录：')) {
                wordStr = wordStr.substring(
                    0,
                    contentHTML.outerHTML.indexOf('附录：'),
                );
            }
            wordStr = wordStr
                .replace(/<table(.*?)>/g, '<table$1 border="1">')
                .replace(/<th(.*?)>/g, '<th$1 style="width: 10%">')
                .replace(
                    /<div[^>]*id=("nightingle-rose-title"|"nightingle-rose-content")[^>]*>[\s\S]*?<\/div>/g,
                    '',
                );

            saveAs(
                // 保存文件到本地
                htmlDocx.asBlob(wordStr), // 将html转为docx
                `${reportTitleRef.current}.doc`,
            );
        } finally {
            setWordDownloadLoading(false);
        }
    };

    return (
        <WizardDrawer
            drawer={drawer}
            width="75%"
            title={title}
            footer={
                <Button
                    key="link"
                    onClick={() => {
                        drawer.close();
                    }}
                >
                    关闭
                </Button>
            }
        >
            <div className="w-full flex justify-end">
                {/* <Button
                    type="link"
                    onClick={(e) => {
                        e.preventDefault();
                        downloadPdf();
                    }}
                >
                    下载PDF报告
                </Button> */}
                <YakitDropdownMenu
                    menu={{
                        data: [
                            {
                                key: 'pdf',
                                label: (
                                    <div
                                        className="p-0 w-full"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            downloadPdf();
                                        }}
                                    >
                                        Pdf
                                    </div>
                                ),
                            },
                            {
                                key: 'html',
                                label: (
                                    <ExportButton
                                        renderType="div"
                                        params={{ id: report_id }}
                                        fileName={
                                            reportTitleRef.current + '.zip'
                                        }
                                        method="get"
                                        url="/timeline/download"
                                        className="p-0 w-full"
                                        title="html"
                                    />
                                ),
                            },
                            {
                                key: 'word',
                                label: (
                                    <div
                                        className="p-0 w-full"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (!wordDownloadLoading) {
                                                downloadWord();
                                            }
                                        }}
                                    >
                                        {wordDownloadLoading
                                            ? '生成中…'
                                            : 'Word'}
                                    </div>
                                ),
                            },
                        ],
                    }}
                    dropdown={{
                        trigger: ['click'],
                        placement: 'bottom',
                    }}
                >
                    <Button type="link" size="small" className="px-1 py-[15px]">
                        下载
                    </Button>
                </YakitDropdownMenu>
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

export { PreviewReportDrawer };
