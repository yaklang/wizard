// Icon 组件类型
interface TIcon extends React.SVGProps<SVGSVGElement> {}

enum Order {
    Asc = 'asc',
    Desc = 'desc',
}

export type { TIcon };
export { Order };
