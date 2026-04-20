import { yakitFailed } from '@/utils/notification'
// 原Buffer 是 Node.js 提供的全局对象，改成了浏览器兼容实现（不再依赖 Buffer）
type DecodeEncoding = 'utf8' | 'latin1'
type EncodeEncoding = 'latin1' | 'ascii' | 'utf8'

export function Uint8ArrayToString(fileData: Uint8Array, encoding?: DecodeEncoding) {
  try {
    const targetEncoding = encoding ?? 'utf8'
    if (targetEncoding === 'utf8') {
      return new TextDecoder('utf-8').decode(fileData)
    }

    // latin1/ascii-like one byte decoding.
    return Array.from(fileData, (byte) => String.fromCharCode(byte)).join('')
  } catch (e) {
    yakitFailed(`Uint8ArrayToString (${fileData}) Failed: ${e}`)
    return `${fileData}`
  }
}

export function StringToUint8Array(str: string, encoding?: EncodeEncoding) {
  try {
    const targetEncoding = encoding ?? 'utf8'
    if (targetEncoding === 'utf8') {
      return new TextEncoder().encode(str)
    }

    // latin1/ascii-like one byte encoding.
    return Uint8Array.from(Array.from(str, (char) => char.charCodeAt(0) & 0xff))
  } catch (e) {
    yakitFailed(`String ${str} Encode Failed: ${e}`)
    return new TextEncoder().encode(`${str}`)
  }
}

export function removeRepeatedElement<T = string>(arr: T[]) {
  return arr.filter((element, index) => {
    return arr.indexOf(element) === index
  })
}
