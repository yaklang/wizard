import { FC, useRef } from 'react';

import { data } from './data';

import CopyOutlined from './compoment/svg/CopyOutlined';
import FormOutlined from './compoment/svg/FormOutlined';
import DeleteOutlined from './compoment/svg/DeleteOutlined';

import styles from './index.module.scss';
import { UseModalRefType } from '@/compoments/WizardModal/useModal';
import { StartUpScriptModal } from './compoment/StartUpScriptModal';
import { TaskScriptTags } from './compoment/TaskScriptTags';

const TaskScript: FC = () => {
    const StartUpScriptModalRef = useRef<UseModalRefType>(null);

    return (
        <div className="p-4 ">
            <div className="grid grid-cols-3 gap-4">
                {data?.map((items, key) => {
                    return (
                        <div key={items.type} className={styles['wizard-card']}>
                            <div className={styles['card-header']}>
                                <div
                                    className={`text-clip ${styles['card-header-text']}`}
                                >
                                    2023-12-19 Shiro FastJson
                                </div>
                                <div className={styles['card-header-icon']}>
                                    <div
                                        style={{
                                            borderRight: '1px solid #EAECF3',
                                        }}
                                    >
                                        <FormOutlined />
                                    </div>
                                    <div
                                        style={{
                                            borderRight: '1px solid #EAECF3',
                                        }}
                                    >
                                        <CopyOutlined />
                                    </div>
                                    <div>
                                        <DeleteOutlined />
                                    </div>
                                </div>
                            </div>
                            <div className={styles['card-content']}>
                                <TaskScriptTags items={items} keys={key} />
                                <div
                                    className={`text-clip2 ${styles['content-describe']}`}
                                >
                                    {items.type}
                                </div>
                            </div>
                            <div
                                className={styles['card-footer']}
                                onClick={() =>
                                    StartUpScriptModalRef.current?.open()
                                }
                            >
                                使用模版
                            </div>
                        </div>
                    );
                })}
            </div>
            <StartUpScriptModal
                ref={StartUpScriptModalRef}
                runAsync={() => console.log(1)}
            />
        </div>
    );
};

export { TaskScript };
