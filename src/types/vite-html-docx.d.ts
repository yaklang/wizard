/** 无官方类型，与 html-docx-js 的 asBlob 用法一致 */
declare module 'vite-html-docx' {
    const htmlDocx: {
        asBlob: (html: string, options?: Record<string, unknown>) => Blob;
    };
    export default htmlDocx;
}
