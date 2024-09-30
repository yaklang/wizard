import { FC, useReducer } from 'react';

import { Table } from 'antd';

import { TWizardTableProps } from './types';
import WizardTableFilter from '../WizardTableFilter';
import { initialValue } from './data';

const reducer = <T extends typeof initialValue>(state: T, payload: T): T => ({
    ...state,
    ...payload,
});

// 分布式平台table
const WizardTable: FC<TWizardTableProps> = (props) => {
    const { tableHeader } = props;

    const [state, dispatch] = useReducer(reducer, initialValue);
    console.log(state, 'state');

    return (
        <div className="w-full p-4 bg-[#fff]">
            <WizardTableFilter
                props={{ ...tableHeader, filterDispatch: dispatch }}
            />

            <Table bordered pagination={false} {...props} />
        </div>
    );
};

export default WizardTable;
