import dayjs from 'dayjs';

function adjustTimestamp(timestamp: number): dayjs.Dayjs {
    // 获取当前时间并向后推 7 小时
    const sevenHoursLater = dayjs().add(7, 'hour');

    // 判断传入的时间戳是否大于等于当前时间往后推七小时
    if (
        dayjs(timestamp).isAfter(sevenHoursLater) ||
        dayjs(timestamp).isSame(sevenHoursLater)
    ) {
        // 如果大于等于，减去 8 小时时差
        return dayjs(timestamp).subtract(8, 'hour');
    } else {
        // 否则返回当前时间
        return dayjs();
    }
}
const DNSLogOptions = [
    {
        label: '内置',
        value: 'builtin',
    },
];

export { DNSLogOptions, adjustTimestamp };
