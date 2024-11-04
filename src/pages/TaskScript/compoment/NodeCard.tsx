import { FC } from 'react';
import { CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { type TScannerDataList } from './StartUpScriptModal';

interface TNodeCard {
    list: TScannerDataList;
    value: any[];
    onChange: (values: any[]) => void;
}

const NodeCard: FC<Partial<TNodeCard>> = ({ value, onChange, list }) => {
    return (
        <div className="grid grid-cols-3 gap-3 bg-[#F8F8F8] p-3 rounded">
            {Array.isArray(list) &&
                list
                    .concat({
                        name: '新建节点',
                        date: '新建节点',
                        size: 10,
                    })
                    .map((it) => {
                        return (
                            <div
                                key={it.name}
                                className="relative cursor-pointer bg-white border border-solid border-[#EAECF3] p-4 rounded-lg flex flex-col gap-1 overflow-hidden hover:border-[#4A94F8]"
                                style={{
                                    transition: 'all 0.3s ease',
                                }}
                                onClick={() => {
                                    // 勾选状态
                                    const resultValus = value?.includes(it.name)
                                        ? value.filter(
                                              (item) => item !== it.name,
                                          )
                                        : [...(value ?? []), it.name];
                                    // 放入form内
                                    onChange?.(resultValus);
                                }}
                            >
                                <div
                                    className={`absolute right-0 top-0 w-8 h-8 flex items-start justify-end pt-1 pr-1 ${value?.includes(it.name) ? 'bg-[#4A94F8]' : 'bg-[#EAECF3]'}`}
                                    style={{
                                        clipPath:
                                            'polygon(100% 100%, 100% 0, 0 0)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    <CheckOutlined className="text-xs text-white" />
                                </div>

                                <div className="text-base text-[#31343F] font-semibold">
                                    {it.name}
                                </div>
                                <div className="text-sm text-[#85899E] text-xs">
                                    当前任务量
                                    <span className="text-[#4A94F8]">
                                        {' '}
                                        {it.size}
                                    </span>
                                </div>
                                <div className="text-sm text-[#85899E] flex items-center text-xs">
                                    <ClockCircleOutlined className="mr-1" />
                                    {it.date}秒前活跃
                                </div>
                            </div>
                        );
                    })}
        </div>
    );
};

export { NodeCard };
