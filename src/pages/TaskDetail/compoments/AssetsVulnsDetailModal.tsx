import type { TGetAssetsVulnsResponse } from '@/apis/taskDetail/types';
import { WizardModal } from '@/compoments';
import type { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { useSafeState } from 'ahooks';
import { Col, Row, Typography } from 'antd';
import { forwardRef, useImperativeHandle } from 'react';

import dayjs from 'dayjs';
import { SeverityMapTag } from './utils';
const { Paragraph } = Typography;

const AssetsVulnsDetailModal = forwardRef<
    UseModalRefType,
    {
        title: string;
    }
    // eslint-disable-next-line complexity
>(({ title }, ref) => {
    const [model] = WizardModal.useModal();
    const [info, setInfo] = useSafeState<TGetAssetsVulnsResponse>();

    useImperativeHandle(ref, () => ({
        open(render) {
            setInfo(render);
            model.open();
        },
    }));

    return (
        <WizardModal footer={null} width={850} modal={model} title={title}>
            <div className="px-2 pb-2">
                <Row>
                    <Col span={24}>
                        <div className="flex items-start gap-2 mb-2 flex-col">
                            <div className="flex gap-4 items-center">
                                <img
                                    className="w-8 h-8 pr-4 border-r-solid border-r-[1px] border-r-[#EAECF3]"
                                    src={
                                        SeverityMapTag.find((item) =>
                                            item.key.includes(
                                                info?.severity || '',
                                            ),
                                        )?.img
                                    }
                                />
                                <div className="color-[#31343F] text-base font-semibold text-clip">
                                    {info?.title_verbose || info?.title}
                                </div>
                            </div>
                            <div className="ml-16 flex gap-4 items-center">
                                <span className="text-xs font-normal flex items-center">
                                    <span className="mr-1">URL:</span>
                                    <span className="color-[#85899E] ">
                                        {' '}
                                        {info?.url ? (
                                            <Paragraph copyable>
                                                {info?.url}
                                            </Paragraph>
                                        ) : (
                                            '-'
                                        )}
                                    </span>
                                </span>
                                <span className="text-xs font-normal">
                                    发现时间{' '}
                                    <span className="color-[#85899E]">
                                        {' '}
                                        {info?.created_at &&
                                        info?.created_at > 0
                                            ? dayjs
                                                  .unix(info?.created_at)
                                                  .format('YYYY-MM-DD HH:ss')
                                            : '-'}
                                    </span>
                                </span>
                                <span className="text-xs font-normal">
                                    最近更新时间{' '}
                                    <span className="color-[#85899E]">
                                        {' '}
                                        {info?.created_at &&
                                        info?.created_at > 0
                                            ? dayjs
                                                  .unix(info?.updated_at)
                                                  .format('YYYY-MM-DD HH:ss')
                                            : '-'}
                                    </span>
                                </span>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        IP
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.ip_addr || '-'}</div>
                    </Col>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        ID
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.id || '-'}</div>
                    </Col>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        端口
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.port || '-'}</div>
                    </Col>
                </Row>
                <Row>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        Host
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.host || '-'}</div>
                    </Col>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        类型
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.risk_type_verbose || info?.risk_type}</div>
                    </Col>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        来源
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.from_yak_script || '漏洞检测'}</div>
                    </Col>
                </Row>
                <Row>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        返连Token
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.reverse_token || '-'}</div>
                    </Col>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        Hash
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div>{info?.hash || '-'}</div>
                    </Col>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        验证状态
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={5}
                    >
                        <div
                            style={{
                                color: `${!info?.detail?.WaitingVerified ? '#11AB4E' : '#FAAF2B'}`,
                            }}
                        >
                            {!info?.detail?.WaitingVerified
                                ? '已验证'
                                : '未验证'}
                        </div>
                    </Col>
                </Row>

                <Row>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        漏洞描述
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={21}
                    >
                        <div>{info?.detail?.Description || '-'}</div>
                    </Col>
                </Row>
                <Row>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        解决方案
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={21}
                    >
                        <div>{info?.detail?.Solution || '-'}</div>
                    </Col>
                </Row>
                <Row>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        Parameter
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={21}
                    >
                        <div>{info?.detail?.Parameter || '-'}</div>
                    </Col>
                </Row>
                <Row>
                    <Col
                        className="bg-[#F0F1F3] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={3}
                    >
                        Payload
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] min-h-10 py-3 px-4 border-[#EAECF3] border"
                        span={21}
                    >
                        <div>{info?.payload || '-'}</div>
                    </Col>
                </Row>
                <Row>
                    <Col
                        className="bg-[#F0F1F3] py-3 px-4 border-[#EAECF3] flex items-center border"
                        span={3}
                    >
                        详情
                    </Col>
                    <Col
                        className="bg-[#F8F8F8] py-3 px-4 border-[#EAECF3] border"
                        span={21}
                    >
                        <div style={{ maxHeight: 180, overflow: 'auto' }}>
                            {info?.detail
                                ? `${JSON.stringify(info?.detail)}`
                                : '-'}
                        </div>
                    </Col>
                </Row>
            </div>
        </WizardModal>
    );
});

export { AssetsVulnsDetailModal };
