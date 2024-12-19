import { FC, memo } from 'react';

import { randomString } from '@/utils';

interface TIpTagProps {
    value?: string[];
    onChange?: (value: TIpTagProps['value']) => TIpTagProps['value'];
    data: Array<any>;
}

const FilterTag: FC<TIpTagProps> = memo(({ value, onChange, data }) => {
    return (
        <div className="flex gap-2">
            {data.map((it) =>
                value?.includes(it.value) ? (
                    <div
                        className={`px-1 rounded cursor-pointer bg-[#4a94f8] text-[#fff]`}
                        key={it.Total + randomString(10)}
                        onClick={() =>
                            onChange?.(
                                value?.includes(it.value)
                                    ? value?.filter((key) => key !== it.value)
                                    : value?.concat(it.value),
                            )
                        }
                    >
                        {it.label}
                    </div>
                ) : (
                    <div
                        className={`px-1 rounded cursor-pointer bg-[#f0f1f3] text-[#262626] hover:text-[#4a94f8]`}
                        key={it.Total + randomString(10)}
                        onClick={() =>
                            onChange?.(
                                value?.includes(it.value)
                                    ? value?.filter((key) => key !== it.value)
                                    : value?.concat(it.value),
                            )
                        }
                    >
                        {it.label}
                    </div>
                ),
            )}
        </div>
    );
});

export { FilterTag };
