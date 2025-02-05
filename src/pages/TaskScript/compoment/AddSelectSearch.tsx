import type { FC } from 'react';
import { useEffect } from 'react';

import { useSafeState } from 'ahooks';
import { Select } from 'antd';

type TScriptGrounpList = Array<{ value: string; label: string }>;

interface AddSelectSearchProps {
    scriptGroupListRef: React.MutableRefObject<TScriptGrounpList | undefined>;
    scriptGroupList: TScriptGrounpList;
    onChange?: (value: string | number) => void;
    value?: string | number;
}

const AddSelectSearch: FC<AddSelectSearchProps> = ({
    scriptGroupListRef,
    scriptGroupList,
    onChange,
    value,
}) => {
    const [copyScriptGroupList, setCopyScriptGroupList] =
        useSafeState<TScriptGrounpList>([]);

    useEffect(() => {
        setCopyScriptGroupList(scriptGroupList);
        scriptGroupListRef.current = scriptGroupList ?? [];
    }, [scriptGroupList]);
    return (
        <Select
            placeholder="请选择..."
            showSearch
            optionFilterProp="label"
            value={value}
            onBlur={() => {
                const targetScriptGroup =
                    scriptGroupListRef.current?.filter((item) => item.label) ??
                    [];
                setCopyScriptGroupList(targetScriptGroup);
            }}
            onSearch={(value) => {
                setTimeout(() => {
                    setCopyScriptGroupList((list) => {
                        const concatList =
                            list.findIndex((it) => it.value === value) === -1
                                ? list.concat({
                                      label: `${value}`,
                                      value,
                                  })
                                : list;
                        const resultGroupList =
                            concatList?.filter((item) => item.label) ?? [];
                        return resultGroupList;
                    });
                }, 500);
            }}
            onSelect={(value, options) => {
                const addList = scriptGroupListRef.current!.concat({
                    label: options.value,
                    value: options.value,
                });
                const resultList = addList.filter(
                    (item, index, self) =>
                        self.findIndex((obj) => obj.value === item.value) ===
                        index,
                );
                scriptGroupListRef.current = resultList;
                setCopyScriptGroupList(resultList);
                onChange?.(value);
            }}
            options={copyScriptGroupList ?? scriptGroupList}
        />
    );
};

export { AddSelectSearch };
