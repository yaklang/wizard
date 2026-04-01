import { Upload, Form, Spin, Divider } from 'antd'
import React, { type ReactNode, useMemo, useState } from 'react'
import type {
  FileDraggerProps,
  YakitDraggerContentProps,
  YakitDraggerProps,
  YakitFormDraggerContentProps,
  YakitFormDraggerProps,
} from './YakitFormType'
import styles from './YakitForm.module.scss'
import classNames from 'classnames'
import { YakitInput } from '../YakitInput/YakitInput'
import { useMemoizedFn } from 'ahooks'
import { failed, yakitNotify } from '@/utils/notification'

const { Dragger } = Upload

const isAcceptEligible = (path: string, accept?: string) => {
  const index = path.lastIndexOf('.')
  const fileType = path.substring(index, path.length)
  if (accept === '.*') {
    return index === -1 ? false : true
  }
  return accept ? accept.split(',').includes(fileType) : true
}

/**
 * @description:YakitFormDragger  form表单的文件拖拽  文件夹不支持拖拽
 * @augments YakitFormDraggerProps 继承antd的 DraggerProps 默认属性 和 YakitDraggerProps
 */
export const YakitFormDragger: React.FC<YakitFormDraggerProps> = React.memo((props) => {
  const { formItemProps = {}, size, formItemClassName, ...restProps } = props
  return (
    <Form.Item
      {...formItemProps}
      className={classNames(
        styles['form-label-middle'],
        {
          [styles['form-label-small']]: size === 'small',
          [styles['form-label-large']]: size === 'large',
        },
        formItemClassName,
      )}
    >
      <YakitDragger size={size} {...restProps} />
    </Form.Item>
  )
})

/**
 * @description:YakitDragger  支持拖拽:文件/文件夹 文件路径只包括文件夹或者文件的第一级路径, 不包括文件夹下面的子文件路径数;
 * @description 如果需要显示文件中的内容，推荐使用组件:YakitDraggerContent
 * @augments YakitDraggerProps 
 * eg:  <YakitFormDraggerContent
        className={styles["plugin-execute-form-item"]}
        formItemProps={{
             name: "Input",
             label: "扫描目标",
             rules: [{required: true}]
        }}
        accept='.txt,.xlsx,.xls,.csv'
        textareaProps={{
            placeholder: "请输入扫描目标，多个目标用“英文逗号”或换行分隔"
        }}
        help='可将TXT、Excel文件拖入框内或'
        disabled={disabled}
    />
 */
export const YakitDragger: React.FC<YakitDraggerProps> = React.memo((props) => {
  const {
    size,
    inputProps = {},
    help = '可将文件拖入框内或点击此处',
    value: fileName,
    onChange: setFileName,
    setContent,
    showDefHelp = true,
    selectType = 'file',
    renderType = 'input',
    textareaProps = {},
    disabled,
    isShowPathNumber = true,
    multiple,
  } = props
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  const [name, setName] = useState<string>('')

  const getContent = useMemoizedFn((path: string, fileType: string) => {
    if (!path) {
      failed('请输入路径')
      return
    }
    const index = path.lastIndexOf('.')

    if (selectType === 'file' && index === -1) {
      failed('请输入正确的路径')
      return
    }

    if (props.accept && !props.accept.split(',').includes(fileType)) {
      failed(`仅支持${props.accept}格式的文件`)
      return
    }
    // 设置名字
    if (setFileName) {
      setFileName(path)
    }
    if (selectType === 'file' && setContent) {
      setUploadLoading(true)
      // ipcRenderer
      //     .invoke("fetch-file-content", path)
      //     .then((res) => {
      //         setContent(res)
      //     })
      //     .catch((err) => {
      //         failed("数据获取失败：" + err)
      //         setContent("")
      //     })
      //     .finally(() => setTimeout(() => setUploadLoading(false), 200))
    }
  })

  const renderContentValue = useMemoizedFn(() => {
    switch (renderType) {
      case 'textarea':
        return (
          <YakitInput.TextArea
            placeholder="路径支持手动输入,输入多个请用逗号分隔"
            value={fileName || name}
            disabled={disabled}
            {...textareaProps}
            onChange={(e) => {
              setName(e.target.value)
              if (setFileName) setFileName(e.target.value)
              if (textareaProps.onChange) textareaProps.onChange(e)
              e.stopPropagation()
            }}
            onPressEnter={(e) => {
              e.stopPropagation()
              const index = name.lastIndexOf('.')
              if (selectType === 'file' && index === -1) {
                failed('请输入正确的路径')
                return
              }
              const type = name.substring(index, name.length)
              getContent(name, type)
              if (textareaProps.onPressEnter) textareaProps.onPressEnter(e)
            }}
            onFocus={(e) => {
              e.stopPropagation()
              if (textareaProps.onFocus) textareaProps.onFocus(e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (textareaProps.onClick) textareaProps.onClick(e)
            }}
            onBlur={(e) => {
              e.stopPropagation()
              if (!name) return
              const index = name.lastIndexOf('.')
              if (selectType === 'file' && index === -1) {
                failed('请输入正确的路径')
                return
              }
              const type = name.substring(index, name.length)
              getContent(name, type)
              if (textareaProps.onBlur) textareaProps.onBlur(e)
            }}
          />
        )

      default:
        return (
          <YakitInput
            placeholder="路径支持手动输入,输入多个请用逗号分隔"
            size={size}
            value={fileName || name}
            disabled={disabled}
            {...inputProps}
            onChange={(e) => {
              setName(e.target.value)
              if (setFileName) setFileName(e.target.value)
              if (inputProps.onChange) inputProps.onChange(e)
              e.stopPropagation()
            }}
            onPressEnter={(e) => {
              e.stopPropagation()
              const index = name.lastIndexOf('.')
              if (selectType === 'file' && index === -1) {
                failed('请输入正确的路径')
                return
              }
              const type = name.substring(index, name.length)
              getContent(name, type)
              if (inputProps.onPressEnter) inputProps.onPressEnter(e)
            }}
            onFocus={(e) => {
              e.stopPropagation()
              if (inputProps.onFocus) inputProps.onFocus(e)
            }}
            onClick={(e) => {
              e.stopPropagation()
              if (inputProps.onClick) inputProps.onClick(e)
            }}
            onBlur={(e) => {
              e.stopPropagation()
              if (!name) return
              const index = name.lastIndexOf('.')
              if (selectType === 'file' && index === -1) {
                failed('请输入正确的路径')
                return
              }
              const type = name.substring(index, name.length)
              getContent(name, type)
              if (inputProps.onBlur) inputProps.onBlur(e)
            }}
          />
        )
    }
  })

  const renderContent = useMemoizedFn((helpNode: ReactNode) => {
    return (
      <Spin spinning={uploadLoading}>
        {renderContentValue()}
        <div
          className={classNames(styles['dragger-help-middle'], {
            [styles['dragger-help-small']]: size === 'small',
            [styles['dragger-help-large']]: size === 'large',
          })}
        >
          {(showDefHelp && helpNode) || null}
        </div>
      </Spin>
    )
  })
  /**
   * @description 选择文件夹
   */
  const onUploadFolder = useMemoizedFn(() => {
    if (disabled) return
    const input = document.createElement('input')
    input.type = 'file'
    if (multiple !== false) {
      input.multiple = true
    }
    input.setAttribute('webkitdirectory', '')
    input.setAttribute('directory', '')
    input.onchange = () => {
      const files = Array.from(input.files || [])
      if (files.length && setFileName) {
        const paths = files.map((file) => file.webkitRelativePath || file.name)
        setFileName(paths.join(','))
      }
    }
    input.click()
  })

  const onUploadFile = useMemoizedFn(() => {
    if (disabled) return
    const input = document.createElement('input')
    input.type = 'file'
    if (multiple !== false) {
      input.multiple = true
    }
    if (props.accept) {
      input.accept = props.accept
    }
    input.onchange = () => {
      const files = Array.from(input.files || [])
      if (files.length) {
        const absolutePath = files
          .map((file) => file.name)
          .filter((path) => isAcceptEligible(path, props.accept || '.*'))
        if (setFileName) setFileName(absolutePath.join(','))
      }
    }
    input.click()
  })

  const afterFolderDrop = useMemoizedFn((e) => {
    const { files = [] } = e.dataTransfer
    let paths: string[] = []
    let isNoFit: string[] = []
    const filesLength = files.length
    if (multiple === false && filesLength > 1) {
      yakitNotify('error', '不支持多选')
      return
    }
    for (let index = 0; index < filesLength; index++) {
      const element = files[index]
      const path = element.path || ''
      const number = path.lastIndexOf('.')
      if (number !== -1) {
        isNoFit.push(path)
      } else {
        paths.push(path)
      }
    }
    if (isNoFit.length > 0) {
      yakitNotify('error', '已自动过滤不符合条件的数据')
    }
    if (filesLength > isNoFit.length && setFileName) setFileName(paths.join(','))
  })

  const afterFileDrop = useMemoizedFn((e) => {
    const { files = [] } = e.dataTransfer
    let paths: string[] = []
    let isNoFit: string[] = []
    const filesLength = files.length
    if (multiple === false && filesLength > 1) {
      yakitNotify('error', '不支持多选')
      return
    }
    for (let index = 0; index < filesLength; index++) {
      const element = files[index]
      const path = element.path || ''
      if (isAcceptEligible(path, props.accept || '.*')) {
        paths.push(path)
      } else {
        isNoFit.push(path)
      }
    }
    if (isNoFit.length > 0) {
      yakitNotify('error', '已自动过滤不符合条件的数据')
    }
    if (filesLength > isNoFit.length && setFileName) setFileName(paths.join(','))
  })

  const afterAllDrop = useMemoizedFn((e) => {
    const { files = [] } = e.dataTransfer
    let paths: string[] = []
    const filesLength = files.length
    if (multiple === false && filesLength > 1) {
      yakitNotify('error', '不支持多选')
      return
    }
    for (let index = 0; index < filesLength; index++) {
      const element = files[index]
      const path = element.path || ''
      paths.push(path)
    }
    if (setFileName) setFileName(paths.join(','))
  })
  const fileNumber = useMemo(() => {
    let arr: string[] = []
    try {
      const path = fileName || name
      arr = path ? path.split(',') : []
    } catch (error) {
      yakitNotify('error', '文件路径数识别错误,请以逗号进行分割')
    }
    return arr.length
  }, [fileName, name])
  return (
    <>
      {selectType === 'file' && (
        <FileDragger onDrop={afterFileDrop}>
          {renderContent(
            <div className={styles['form-item-help']}>
              <span>
                {help}
                <span
                  className={classNames(styles['dragger-help-active'], {
                    [styles['dragger-help-active-disabled']]: disabled,
                  })}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUploadFile()
                  }}
                >
                  上传文件
                </span>
              </span>
              {isShowPathNumber && (
                <span>
                  识别到
                  <span className={styles['dragger-help-number']}>{fileNumber}</span>
                  个文件路径
                </span>
              )}
            </div>,
          )}
        </FileDragger>
      )}
      {selectType === 'folder' && (
        <FileDragger onDrop={afterFolderDrop}>
          {renderContent(
            <div className={styles['form-item-help']}>
              <span>
                {help}
                <span
                  className={classNames(styles['dragger-help-active'], {
                    [styles['dragger-help-active-disabled']]: disabled,
                  })}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUploadFolder()
                  }}
                >
                  上传文件夹
                </span>
              </span>
              {isShowPathNumber && (
                <span>
                  识别到
                  <span className={styles['dragger-help-number']}>{fileNumber}</span>
                  个文件路径
                </span>
              )}
            </div>,
          )}
        </FileDragger>
      )}
      {selectType === 'all' && (
        <FileDragger onDrop={afterAllDrop}>
          {renderContent(
            <div className={styles['form-item-help']}>
              <span>
                {help}
                <span
                  className={classNames(styles['dragger-help-active'], {
                    [styles['dragger-help-active-disabled']]: disabled,
                  })}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUploadFile()
                  }}
                >
                  上传文件
                </span>
                <Divider type="vertical" />
                <span
                  className={classNames(styles['dragger-help-active'], {
                    [styles['dragger-help-active-disabled']]: disabled,
                  })}
                  onClick={(e) => {
                    e.stopPropagation()
                    onUploadFolder()
                  }}
                >
                  上传文件夹
                </span>
              </span>

              {isShowPathNumber && (
                <span>
                  识别到
                  <span className={styles['dragger-help-number']}>{fileNumber}</span>
                  个文件路径
                </span>
              )}
            </div>,
          )}
        </FileDragger>
      )}
    </>
  )
})

export const YakitDraggerContent: React.FC<YakitDraggerContentProps> = React.memo((props) => {
  const {
    value,
    disabled,
    size,
    textareaProps = {},
    onChange,
    help,
    showDefHelp,
    fileLimit = 1024,
    valueSeparator = ',',
    ...restProps
  } = props
  const [uploadLoading, setUploadLoading] = useState<boolean>(false)
  const renderContent = useMemoizedFn((helpNode: ReactNode) => {
    return (
      <Spin spinning={uploadLoading}>
        <YakitInput.TextArea
          placeholder="路径支持手动输入,输入多个请用逗号分隔"
          value={value}
          disabled={disabled}
          {...textareaProps}
          onChange={(e) => {
            if (onChange) onChange(e.target.value)
            if (textareaProps.onChange) textareaProps.onChange(e)
            e.stopPropagation()
          }}
          onPressEnter={(e) => {
            e.stopPropagation()
            if (textareaProps.onPressEnter) textareaProps.onPressEnter(e)
          }}
          onFocus={(e) => {
            e.stopPropagation()
            if (textareaProps.onFocus) textareaProps.onFocus(e)
          }}
          onClick={(e) => {
            e.stopPropagation()
            if (textareaProps.onClick) textareaProps.onClick(e)
          }}
          onBlur={(e) => {
            e.stopPropagation()
            if (textareaProps.onBlur) textareaProps.onBlur(e)
          }}
        />
        <div
          className={classNames(styles['dragger-help-middle'], {
            [styles['dragger-help-small']]: size === 'small',
            [styles['dragger-help-large']]: size === 'large',
          })}
        >
          {helpNode}
        </div>
      </Spin>
    )
  })

  const onHandlerFile = useMemoizedFn((item: { size: number; path: string; file: File }) => {
    if (item.size / 1024 > fileLimit) {
      yakitNotify('error', `文件大小不能超过${fileLimit}KB`)
      return
    }
    const path = item.path.replace(/\\/g, '\\')
    if (isAcceptEligible(path, props.accept || '.*')) {
      onGetContent(item.file)
    } else {
      yakitNotify('error', '文件类型不支持')
    }
  })

  const afterFileDrop = useMemoizedFn((e) => {
    if (disabled) return
    const { files = [] } = e.dataTransfer
    const filesLength = files.length
    if (filesLength > 1) {
      yakitNotify('error', '多选的文件只会选择其中一个文件处理')
    }
    if (filesLength > 0) {
      const item = files[0]
      onHandlerFile({
        size: item.size,
        path: item.name,
        file: item,
      })
    }
  })

  const onUploadFile = useMemoizedFn((e) => {
    e.stopPropagation()
    if (disabled) return
    const input = document.createElement('input')
    input.type = 'file'
    if (props.accept) {
      input.accept = props.accept
    }
    input.onchange = () => {
      const files = Array.from(input.files || [])
      if (files.length > 1) {
        yakitNotify('error', '只支持单文件上传')
      }
      if (files.length > 0) {
        const item = files[0]
        onHandlerFile({
          size: item.size,
          path: item.name,
          file: item,
        })
      }
    }
    input.click()
  })

  const onGetContent = useMemoizedFn(async (file: File) => {
    setUploadLoading(true)
    try {
      const fileName = file.name || ''
      const type = fileName.split('.').pop()?.toLowerCase() || ''
      const typeArr = ['csv', 'xls', 'xlsx']

      if (typeArr.includes(type)) {
        if (type === 'xls') {
          throw new Error('暂不支持 .xls，请转为 .xlsx')
        }

        if (type === 'csv') {
          const text = await file.text()
          const rows = text
            .split(/\r?\n/)
            .filter(Boolean)
            .map((line) => line.trim())
          if (onChange) onChange(rows.join(valueSeparator))
          return
        }

        throw new Error('浏览器环境暂不支持 .xlsx，请转为 .csv 或 .txt')
      } else {
        const text = await file.text()
        if (onChange) onChange(text)
      }
    } catch (err) {
      failed('数据获取失败：' + err)
    } finally {
      setTimeout(() => setUploadLoading(false), 200)
    }
  })
  return (
    <Dragger
      onDrop={afterFileDrop}
      {...restProps}
      disabled={disabled}
      showUploadList={false}
      directory={false}
      multiple={false}
      className={classNames(styles['yakit-dragger'], props.className)}
      beforeUpload={() => {
        return false
      }}
    >
      {renderContent(
        <div className={classNames(styles['form-item-help'], styles['form-item-content-help'])}>
          <label>
            {help ? help : showDefHelp ? '可将文件拖入框内或' : ''}
            <span
              className={classNames(styles['dragger-help-active'], {
                [styles['dragger-help-active-disabled']]: disabled,
              })}
              onClick={onUploadFile}
            >
              点击此处上传
            </span>
          </label>
        </div>,
      )}
    </Dragger>
  )
})

export const YakitFormDraggerContent: React.FC<YakitFormDraggerContentProps> = React.memo((props) => {
  const { formItemProps = {}, size, formItemClassName, ...restProps } = props
  return (
    <Form.Item
      {...formItemProps}
      className={classNames(
        styles['form-label-middle'],
        {
          [styles['form-label-small']]: size === 'small',
          [styles['form-label-large']]: size === 'large',
        },
        formItemClassName,
      )}
    >
      <YakitDraggerContent {...restProps} size={size} />
    </Form.Item>
  )
})

const FileDragger: React.FC<FileDraggerProps> = React.memo((props) => {
  const { disabled, multiple, onDrop, className, children } = props
  return (
    <div
      onDropCapture={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) return
        const { files = [] } = e.dataTransfer
        const filesLength = files.length
        if (multiple === false && filesLength > 1) {
          yakitNotify('error', '不允许多选')
          return
        }
        if (onDrop) onDrop(e)
      }}
      className={classNames(styles['yakit-dragger'], className)}
    >
      {children}
    </div>
  )
})
