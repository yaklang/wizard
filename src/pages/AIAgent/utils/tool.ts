import isNil from 'lodash/isNil'

/** @name 将传入对象中值为null或undefined的键值对删除 */
export const toolDelInvalidKV = (data: any) => {
  try {
    if (!data) return data
    if (!isObject(data)) return data
    for (const key in data) {
      if (isNil(data[key])) {
        delete data[key]
      } else if (isObject(data[key])) {
        toolDelInvalidKV(data[key])
      }
    }
    return data
  } catch (error) {
    return data
  }
}

/** 判断值是否为对象 */
export const isObject = (value: any) => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

export interface JSONParseLogOption {
  page?: string
  fun?: string
  reviver?: (key: string, value: any) => any
}
export function JSONParseLog(text: string, option?: JSONParseLogOption) {
  // eslint-disable-next-line no-useless-catch
  try {
    const result = JSON.parse(text, option?.reviver)
    return result
  } catch (err) {
    throw err
  }
}
