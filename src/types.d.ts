// Icon 组件类型
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface TIcon extends React.SVGProps<SVGSVGElement> {}

enum Order {
    Asc = 'asc',
    Desc = 'desc',
}

export type { TIcon };
export { Order };
