import axios from '@/utils/axios';
import { ResponseData } from '@/utils/commonTypes';

// 节点是否安装成功
const getFileExists = (
    file_name: 'yak' | 'docker-compose',
): Promise<ResponseData<boolean>> =>
    axios.get<never, ResponseData<boolean>>(
        `/file-exists?file_name=${file_name}`,
    );

export { getFileExists };
