export enum YakitKeyBoard {
  // #region 键盘上方数字按键
  Digit_0 = '0',
  Digit_1 = '1',
  Digit_2 = '2',
  Digit_3 = '3',
  Digit_4 = '4',
  Digit_5 = '5',
  Digit_6 = '6',
  Digit_7 = '7',
  Digit_8 = '8',
  Digit_9 = '9',
  // #endregion

  // #region 小键盘数字按键
  Numpad_0 = 'Numpad_0',
  Numpad_1 = 'Numpad_1',
  Numpad_2 = 'Numpad_2',
  Numpad_3 = 'Numpad_3',
  Numpad_4 = 'Numpad_4',
  Numpad_5 = 'Numpad_5',
  Numpad_6 = 'Numpad_6',
  Numpad_7 = 'Numpad_7',
  Numpad_8 = 'Numpad_8',
  Numpad_9 = 'Numpad_9',
  // #endregion

  // #region 字母
  KEY_A = 'A',
  KEY_B = 'B',
  KEY_C = 'C',
  KEY_D = 'D',
  KEY_E = 'E',
  KEY_F = 'F',
  KEY_G = 'G',
  KEY_H = 'H',
  KEY_I = 'I',
  KEY_J = 'J',
  KEY_K = 'K',
  KEY_L = 'L',
  KEY_M = 'M',
  KEY_N = 'N',
  KEY_O = 'O',
  KEY_P = 'P',
  KEY_Q = 'Q',
  KEY_R = 'R',
  KEY_S = 'S',
  KEY_T = 'T',
  KEY_U = 'U',
  KEY_V = 'V',
  KEY_W = 'W',
  KEY_X = 'X',
  KEY_Y = 'Y',
  KEY_Z = 'Z',
  // #endregion

  // #region F数字键
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
  F5 = 'F5',
  F6 = 'F6',
  F7 = 'F7',
  F8 = 'F8',
  F9 = 'F9',
  F10 = 'F10',
  F11 = 'F11',
  F12 = 'F12',
  // #endregion

  // #region 功能键
  Shift = 'Shift',
  Control = 'Control',
  Alt = 'Alt',
  Meta = 'Meta',

  Escape = 'Escape',
  Tab = 'Tab',
  CapsLock = 'CapsLock',
  Backspace = 'Backspace',
  Enter = 'Enter',

  Backquote = '`', // `~
  Minus = '-', // -_
  Equal = '=', // =+
  BracketLeft = '[', // [{
  BracketRight = ']', // ]}
  Backslash = '\\', // \|
  Semicolon = ';', // ;:
  Quote = "'", // '"
  Comma = ',', // ,<
  Period = '.', // .>
  Slash = '/', // /?
  Space = 'space', // 空格

  Delete = 'delete',
  Insert = 'insert',
  Home = 'home',
  End = 'end',
  PageUp = 'pageup',
  PageDown = 'pagedown',
  // #endregion

  // #region 方向键
  UpArrow = 'up',
  DownArrow = 'down',
  LeftArrow = 'left',
  RightArrow = 'right',
  // #endregion

  // #region 小键盘功能键
  Numpad_Divide = 'Numpad_Divide', // /
  Numpad_Multiply = 'Numpad_Multiply', // *
  Numpad_Subtract = 'Numpad_Subtract', // -
  Numpad_Add = 'Numpad_Add', // +
  Numpad_Decimal = 'Numpad_Decimal', // .
  // #endregion
}
export enum YakitKeyMod {
  Alt = YakitKeyBoard.Alt,
  Shift = YakitKeyBoard.Shift,
  Control = YakitKeyBoard.Control,
  Meta = YakitKeyBoard.Meta,
  /** mac下对应cmd, win下对应ctrl */
  CtrlCmd = 'ctrl-cmd',
}
/** @name 小键盘上，键位锁定和未锁定时对应的键值 */
export const NumpadKeyTableMaps: Record<string, string> = {
  'Numpad0-0': 'Numpad0',
  'Numpad1-1': 'Numpad1',
  'Numpad2-2': 'Numpad2',
  'Numpad3-3': 'Numpad3',
  'Numpad4-4': 'Numpad4',
  'Numpad5-5': 'Numpad5',
  'Numpad6-6': 'Numpad6',
  'Numpad7-7': 'Numpad7',
  'Numpad8-8': 'Numpad8',
  'Numpad9-9': 'Numpad9',
  'NumpadDecimal-.': 'NumpadDecimal',

  'Numpad0-Insert': 'Insert',
  'Numpad1-End': 'End',
  'Numpad2-ArrowDown': 'ArrowDown',
  'Numpad3-PageDown': 'Numpad3',
  'Numpad4-ArrowLeft': 'ArrowLeft',
  'Numpad6-ArrowRight': 'ArrowRight',
  'Numpad7-Home': 'Home',
  'Numpad8-ArrowUp': 'ArrowUp',
  'Numpad9-PageUp': 'PageUp',
  'NumpadDecimal-Delete': 'Delete',
}

/**
 * @name 物理按键到快捷键按键的映射
 * @key 快捷键按键
 * @value 物理按键
 */
export const KeyboardToKeyTableMaps: Record<YakitKeyBoard, string[]> = {
  '0': ['Digit0'],
  '1': ['Digit1'],
  '2': ['Digit2'],
  '3': ['Digit3'],
  '4': ['Digit4'],
  '5': ['Digit5'],
  '6': ['Digit6'],
  '7': ['Digit7'],
  '8': ['Digit8'],
  '9': ['Digit9'],
  Numpad_0: ['Numpad0'],
  Numpad_1: ['Numpad1'],
  Numpad_2: ['Numpad2'],
  Numpad_3: ['Numpad3'],
  Numpad_4: ['Numpad4'],
  Numpad_5: ['Numpad5'],
  Numpad_6: ['Numpad6'],
  Numpad_7: ['Numpad7'],
  Numpad_8: ['Numpad8'],
  Numpad_9: ['Numpad9'],
  A: ['KeyA'],
  B: ['KeyB'],
  C: ['KeyC'],
  D: ['KeyD'],
  E: ['KeyE'],
  F: ['KeyF'],
  G: ['KeyG'],
  H: ['KeyH'],
  I: ['KeyI'],
  J: ['KeyJ'],
  K: ['KeyK'],
  L: ['KeyL'],
  M: ['KeyM'],
  N: ['KeyN'],
  O: ['KeyO'],
  P: ['KeyP'],
  Q: ['KeyQ'],
  R: ['KeyR'],
  S: ['KeyS'],
  T: ['KeyT'],
  U: ['KeyU'],
  V: ['KeyV'],
  W: ['KeyW'],
  X: ['KeyX'],
  Y: ['KeyY'],
  Z: ['KeyZ'],
  F1: ['F1'],
  F2: ['F2'],
  F3: ['F3'],
  F4: ['F4'],
  F5: ['F5'],
  F6: ['F6'],
  F7: ['F7'],
  F8: ['F8'],
  F9: ['F9'],
  F10: ['F10'],
  F11: ['F11'],
  F12: ['F12'],
  Shift: ['ShiftLeft', 'ShiftRight'],
  Control: ['ControlLeft', 'ControlRight'],
  Alt: ['AltLeft', 'AltRight'],
  Meta: ['MetaLeft', 'MetaRight'],
  Escape: ['Escape'],
  Tab: ['Tab'],
  CapsLock: ['CapsLock'],
  Backspace: ['Backspace'],
  Enter: ['Enter', 'NumpadEnter'],
  '`': ['Backquote'],
  '-': ['Minus'],
  '=': ['Equal'],
  '[': ['BracketLeft'],
  ']': ['BracketRight'],
  '\\': ['Backslash'],
  ';': ['Semicolon'],
  "'": ['Quote'],
  ',': ['Comma'],
  '.': ['Period'],
  '/': ['Slash'],
  space: ['Space'],
  delete: ['Delete'],
  insert: ['Insert'],
  home: ['Home'],
  end: ['End'],
  pageup: ['PageUp'],
  pagedown: ['PageDown'],
  up: ['ArrowUp'],
  down: ['ArrowDown'],
  left: ['ArrowLeft'],
  right: ['ArrowRight'],
  Numpad_Divide: ['NumpadDivide'],
  Numpad_Multiply: ['NumpadMultiply'],
  Numpad_Subtract: ['NumpadSubtract'],
  Numpad_Add: ['NumpadAdd'],
  Numpad_Decimal: ['NumpadDecimal'],
}
