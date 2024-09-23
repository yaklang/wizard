import moment from "moment";

export const randomString = (length: number) => {
    let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
};

export const formatTimestamp = (t: number) => {
    return moment.unix(t).format("YYYY-MM-DD HH:mm:ss")
};