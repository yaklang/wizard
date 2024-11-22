import { TTaskListStatus } from '@/apis/task/types';
import TaskSelectdAll from '@/assets/task/taskSelectdAll.png';
import TaskSiderAll from '@/assets/task/taskSiderAll.png';

type TTaskListStatusType = `${TTaskListStatus}`; // 提取枚举值的联合类型

const options = [
    {
        label: '普通任务',
        value: 1,
    },
    {
        label: '定时任务',
        value: 2,
    },
    {
        label: '周期任务',
        value: 3,
    },
];

const siderTaskGrounpAllList = [
    {
        name: '全部',
        defualtIcon: TaskSiderAll,
        selectdIcon: TaskSelectdAll,
        count: 0,
        isEdit: false,
    },
];

// 定义表格头筛选状态
const taskListStatus: Array<{
    value: TTaskListStatusType;
    label: string;
}> = [
    {
        value: 'success',
        label: '成功',
    },
    {
        value: 'failed',
        label: '失败',
    },
    {
        value: 'running',
        label: '执行中',
    },
    {
        value: 'waiting',
        label: '未开始',
    },
    {
        value: 'enabled',
        label: '启用',
    },
    {
        value: 'disabled',
        label: '停用',
    },
    {
        value: 'cancel',
        label: '取消',
    },
    {
        value: 'finished',
        label: '结束',
    },
];

export { options, siderTaskGrounpAllList, taskListStatus };
