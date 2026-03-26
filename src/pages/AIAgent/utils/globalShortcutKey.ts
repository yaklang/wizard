import { KeyboardToKeyTableMaps, NumpadKeyTableMaps, YakitKeyMod } from '../enums/keyboard'
/** 缓存本次 yakit 打开后的按键 */
const cacheKeyboardToKey: Record<string, string> = {}

const handleKeyboardToKey = (keyboard: KeyboardEvent): string | null => {
  const { key, code } = keyboard
  if (cacheKeyboardToKey[code]) return cacheKeyboardToKey[code]
  if (cacheKeyboardToKey[`${code}-${key}`]) return cacheKeyboardToKey[`${code}-${key}`]

  // 解析是否为部分需要转换的物理按键集合
  const convertCodeValue = NumpadKeyTableMaps[`${code}-${key}`]
  const isConvert = !!convertCodeValue

  // 键盘映射表的键集合
  const keys = Object.keys(KeyboardToKeyTableMaps)
  let hitValue: string | null = null

  for (let el of keys) {
    const keyValue = KeyboardToKeyTableMaps[el as keyof typeof KeyboardToKeyTableMaps]
    if (keyValue.includes(convertCodeValue || code)) {
      hitValue = el
      cacheKeyboardToKey[isConvert ? `${code}-${key}` : code] = el
      break
    }
  }

  return hitValue
}
export const convertKeyEventToKeyCombination = (event: KeyboardEvent): string[] | null => {
  const { altKey, ctrlKey, metaKey, shiftKey } = event

  let key = handleKeyboardToKey(event)

  if (key) {
    const keys: string[] = []
    ctrlKey && keys.push(YakitKeyMod.Control)
    shiftKey && keys.push(YakitKeyMod.Shift)
    altKey && keys.push(YakitKeyMod.Alt)
    metaKey && keys.push(YakitKeyMod.Meta)
    if (!keys.includes(key)) keys.push(key)
    return keys
  }
  return null
}
