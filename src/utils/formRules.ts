// 常用的Form表单rule
import { isNumber, isInteger, isEmpty } from '@/utils';
import type { RuleObject } from 'antd/es/form';
// const phoneReg = /^1[3456789]\d{9}$/
// const telReg = /^0\d{2,3}-?\d{7,8}$/

/** 输入框 - 必填 */
export const requiredInput = { required: true, message: '请输入' };
/** 选择框 - 必填 */
export const requiredSelect = { required: true, message: '请选择' };
/** 手机号 - 选填 */
export const phoneNumber = {
  pattern: /^1[3456789]\d{9}$/,
  message: '请输入正确的手机号',
};
/** 手机号 - 必填 */
export const phoneRequired = [
  { required: true, message: '请输入手机号' },
  { pattern: /^1[3456789]\d{9}$/, message: '请输入正确的手机号' },
];
export const notEmpty = {
  pattern: /^[^\s]*$/,
  message: '不能为空格',
};
/** 正数 - 最多两位小数 - 选填 */
export const unsignedNumber2f = {
  validator: async (_: never, value: number | string) => {
    if (isEmpty(value)) {
      return;
    }
    if (!isNumber(value, false)) {
      throw new Error('无效数字');
    }
    if (Number(value) < 0) {
      throw new Error('不能是负数');
    }
    const regex = /^\d+(\.\d{1,2})?$/;
    if (!regex.test(String(value))) {
      throw new Error('最多两位小数');
    }
  },
};

/** 非负整数 */
export const positiveIntegerRule: RuleObject = {
  validator(_, value) {
    if (value === undefined || value === null) {
      return Promise.resolve();
    }

    const parsedValue = Number(value);
    if (!isNaN(parsedValue) && parsedValue > 0 && parsedValue === Math.floor(parsedValue)) {
      // 如果输入的是正整数，则验证通过
      return Promise.resolve();
    }

    // 否则，验证失败并返回错误消息
    return Promise.reject(new Error('请输入正整数'));
  },
};
export const positiveInteger = {
  validator: async (_: never, value: number | string) => {
    if (isEmpty(value)) {
      return;
    }
    let errorText = '';
    if (!isNumber(value, false)) {
      errorText = '无效数字';
    }
    if (!isInteger(value, false)) {
      errorText = '只能是整数';
    }
    if (Number(value) < 0) {
      errorText = '不能是负数';
    }
    if (Number(value) === 0) {
      errorText = '不能为0';
    }
    if (errorText) {
      return Promise.reject(errorText);
    }
    return Promise.resolve();
  },
};

/** 数字 - 选填 */
export const number = {
  validator: async (_: never, value: number | string) => {
    if (isEmpty(value)) {
      return;
    }
    if (!isNumber(value, false)) {
      throw new Error('无效数字');
    }
  },
};

/** 正数 - 选填 */
export const unsignedNumber = {
  validator: async (_: never, value: number | string) => {
    if (isEmpty(value)) {
      return;
    }
    if (!isNumber(value, false)) {
      throw new Error('无效数字');
    }
    if (Number(value) < 0) {
      throw new Error('不能是负数');
    }
  },
};

// 汉字、大小写英文字母、阿拉伯数字
// /([a-zA-Z0-9]|[自定义英文符号])\{8,\}/ [a-zA-Z0-9]
export const regularText = [
  {
    pattern: /^([\u4e00-\u9fa5]{0,}|[A-Za-z0-9])+$/,
    message: '仅支持汉字、数字、大小写字母',
  },
];

// 大小写英文字母、阿拉伯数字
export const englishNumber = {
  pattern: /^[A-Za-z0-9]+$/,
  message: '仅支持数字、大小写字母',
};
