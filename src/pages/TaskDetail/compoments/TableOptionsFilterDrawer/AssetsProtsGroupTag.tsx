import { Checkbox } from 'antd'
import type { FC } from 'react'

interface TIpTagProps {
  value?: string[]
  onChange?: (value: TIpTagProps['value']) => TIpTagProps['value']
  data: Array<{ label: string; value: string; cout: number }>
}

const AssetsProtsGroupTag: FC<TIpTagProps> = ({ value = [], onChange, data }) => {
  const toggleValue = (itemValue: string) => {
    onChange?.(value.includes(itemValue) ? value.filter((key) => key !== itemValue) : [...value, itemValue])
  }

  return (
    <div>
      {data.map((it) => (
        <div
          key={it.value}
          className={`flex items-center justify-between cursor-pointer mt-3 color-${
            value.includes(it.value) ? '[#4A94F8]' : '[#31343F]'
          }`}
          onClick={() => toggleValue(it.value)}
        >
          <div className="flex items-center gap-2">
            <Checkbox
              checked={value.includes(it.value)}
              onClick={(e) => e.stopPropagation()}
              onChange={() => toggleValue(it.value)}
            />
            <div>{it.label}</div>
          </div>
          <div>{it.cout}</div>
        </div>
      ))}
    </div>
  )
}

export { AssetsProtsGroupTag }
