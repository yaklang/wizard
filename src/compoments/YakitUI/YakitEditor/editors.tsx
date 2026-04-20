import React, { useEffect, useState } from 'react'
import { Card, Form, Popover, Tooltip } from 'antd'
import { useMemoizedFn } from 'ahooks'
import { EnterOutlined, FullscreenOutlined, SettingOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { v4 as uuidv4 } from 'uuid'
import type * as monacoEditor from 'monaco-editor/esm/vs/editor/editor.api'
// 编辑器 注册
import '@/utils/monacoSpec/theme'
import '@/utils/monacoSpec/fuzzHTTP'
import '@/utils/monacoSpec/yakEditor'
import '@/utils/monacoSpec/html'
import HexEditor from 'react-hex-editor'
import styles from './editors.module.scss'
// import { Buffer } from 'buffer';
import type { OperationRecordRes, YakitEditorProps } from './YakitEditorType'
import { YakitEditor } from './YakitEditor'
import { SelectOne } from '@/compoments/ReportTemplate/compoments/utils/InputUtils'
import { StringToUint8Array } from '@/utils/str'
import { getRemoteValue, setRemoteValue } from '@/utils/kv'
import { YakitButton } from '../YakitButton/YakitButton'
import { showYakitModal } from '../YakitModal/YakitModalConfirm'
import { DataCompareModal } from '../compare/DataCompare'
import { showDrawer } from '@/utils/showModal'
import { YakitSwitch } from '../YakitSwitch/YakitSwitch'
export type IMonacoEditor = monacoEditor.editor.IStandaloneCodeEditor

interface DataCompareProps {
  rightCode: Uint8Array
  /** 当存在leftCode时则使用leftCode，否则使用编辑器showValue */
  leftCode?: Uint8Array
  leftTitle?: string
  rightTitle?: string
}

export interface NewHTTPPacketEditorProp {
  /** yakit-editor组件基础属性 */
  disabled?: boolean
  readOnly?: boolean
  noLineNumber?: boolean
  lineNumbersMinChars?: number
  noMinimap?: boolean
  onAddOverlayWidget?: (editor: IMonacoEditor, isShow?: boolean) => any
  extraEditorProps?: YakitEditorProps | any

  /** 扩展属性 */
  originValue: string
  defaultStringValue?: string
  onChange?: (i: Buffer) => any
  disableFullscreen?: boolean
  defaultHeight?: number
  bordered?: boolean
  onEditor?: (editor: IMonacoEditor) => any
  hideSearch?: boolean
  extra?: React.ReactNode
  extraEnd?: React.ReactNode
  emptyOr?: React.ReactNode

  refreshTrigger?: boolean | any
  simpleMode?: boolean
  noHeader?: boolean
  loading?: boolean
  noModeTag?: boolean

  noPacketModifier?: boolean
  noTitle?: boolean
  title?: React.ReactNode
  noHex?: boolean

  // lang
  language?: 'html' | 'http' | 'yak' | any

  system?: string
  isResponse?: boolean
  utf8?: boolean
  theme?: string

  isWebSocket?: boolean
  webSocketValue?: Uint8Array
  webSocketToServer?: Uint8Array

  /** @name 外部控制换行状态 */
  noWordWrapState?: boolean
  /** @name 外部控制字体大小 */
  fontSizeState?: number
  /** @name 是否显示换行符 */
  showLineBreaksState?: boolean
  /** @name 是否增加OverlayWidget */
  isAddOverlayWidget?: boolean
  /** @name 外部控制是否记录操作(拥有此项可记录字体大小及换行符) */
  editorOperationRecord?: string
  /** @name 打开WebFuzzer的回调 */
  webFuzzerCallBack?: () => void
  /** @name 是否显示显示Extra默认项 */
  showDefaultExtra?: boolean
  /** @name 数据对比(默认无对比) */
  dataCompare?: DataCompareProps
}

/** @name 获取换行符是否显示 */
export const HTTP_PACKET_EDITOR_Line_Breaks = 'HTTP_PACKET_EDITOR_Line_Breaks'

export const NewHTTPPacketEditor: React.FC<NewHTTPPacketEditorProp> = (props) => {
  const {
    emptyOr,
    originValue,
    isResponse,
    readOnly,
    editorOperationRecord,
    dataCompare,
    showDefaultExtra = true,
  } = props

  const getEncoding = (): 'utf8' | 'latin1' | 'ascii' => {
    if (isResponse || readOnly || props.utf8) {
      return 'utf8'
    }
    // return "latin1"
    return 'utf8' // 默认还是 UTF8 吧，不然识别不了
  }
  const [mode] = useState('text')
  const [strValue, setStrValue] = useState<string>(originValue)
  const [fontSize, setFontSize] = useState<undefined | number>(12)
  const [showLineBreaks, setShowLineBreaks] = useState<boolean>(true)
  const [hexValue, setHexValue] = useState<Uint8Array>(new Uint8Array(StringToUint8Array(originValue)))
  const [monacoEditor, setMonacoEditor] = useState<IMonacoEditor>()
  const [noWordwrap, setNoWordwrap] = useState(false)
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false)
  const [showValue, setShowValue] = useState<string>(originValue)
  // 对比loading
  const [compareLoading, setCompareLoading] = useState<boolean>(false)
  // 编辑器Id 用于区分每个编辑器
  const [editorId] = useState<string>(uuidv4())
  useEffect(() => {
    if (editorOperationRecord) {
      getRemoteValue(editorOperationRecord).then((data) => {
        if (!data) return
        let obj: OperationRecordRes = JSON.parse(data)
        if (obj?.fontSize) {
          setFontSize(obj?.fontSize)
        }
        if (typeof obj?.showBreak === 'boolean') {
          setShowLineBreaks(obj?.showBreak)
        }
      })
    }
  }, [])

  useEffect(() => {
    setShowValue(originValue)
  }, [originValue])

  const openCompareModal = useMemoizedFn((dataCompare) => {
    setCompareLoading(true)
    setTimeout(() => {
      const m = showYakitModal({
        title: null,
        content: (
          <DataCompareModal
            onClose={() => m.destroy()}
            rightTitle={dataCompare.rightTitle}
            leftTitle={dataCompare.leftTitle}
            leftCode={dataCompare.leftCode ? dataCompare.leftCode : showValue}
            rightCode={dataCompare.rightCode}
            loadCallBack={() => setCompareLoading(false)}
          />
        ),
        onCancel: () => {
          m.destroy()
        },
        width: 1200,
        footer: null,
        closable: false,
        hiddenHeader: true,
      })
    }, 500)
  })

  const [nonce, setNonce] = useState(0)
  // The callback facilitates updates to the source data.
  const handleSetValue = React.useCallback(
    (offset: any, value: any) => {
      hexValue[offset] = value
      setNonce((v) => v + 1)
      setHexValue(hexValue)
    },
    [hexValue],
  )

  useEffect(() => {
    if (readOnly) {
      const value = originValue
      setStrValue(value)
      setHexValue(new Uint8Array(StringToUint8Array(originValue)))
    }
    if (readOnly && monacoEditor) {
      monacoEditor.setSelection({
        startColumn: 0,
        startLineNumber: 0,
        endLineNumber: 0,
        endColumn: 0,
      })
    }
  }, [originValue, readOnly, monacoEditor])

  const empty = !!emptyOr && originValue.length === 0
  return (
    <div className={styles['new-http-packet-editor']}>
      <Card
        className="flex-card"
        size="small"
        loading={props.loading}
        bordered={props.bordered}
        style={{
          height: '100%',
          width: '100%',
          backgroundColor: 'var(--Colors-Use-Basic-Background)',
          display: 'flex',
          flexDirection: 'column',
        }}
        title={
          !props.noHeader && (
            <div style={{ display: 'flex', gap: 2 }}>
              {!props.noTitle &&
                (props.title ? (
                  props.title
                ) : (
                  <span style={{ fontSize: 12 }}>{isResponse ? 'Response' : 'Request'}</span>
                ))}
            </div>
          )
        }
        bodyStyle={{
          padding: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flex: 1,
        }}
        extra={
          !props.noHeader && (
            <div
              style={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
              }}
            >
              {props.extra}
              {dataCompare && dataCompare.rightCode.length > 0 && (
                <YakitButton
                  size="small"
                  type="primary"
                  loading={compareLoading}
                  onClick={() => {
                    openCompareModal(dataCompare)
                  }}
                >
                  对比
                </YakitButton>
              )}
              {showDefaultExtra && (
                <>
                  <Tooltip title="不自动换行">
                    <YakitButton
                      size="small"
                      type={noWordwrap ? 'text' : 'primary'}
                      icon={<EnterOutlined />}
                      onClick={() => {
                        setNoWordwrap(!noWordwrap)
                      }}
                    />
                  </Tooltip>
                  {!props.simpleMode && (
                    <Popover
                      title="配置编辑器"
                      content={
                        <Form
                          onSubmitCapture={(e) => {
                            e.preventDefault()
                          }}
                          size="small"
                          layout="horizontal"
                          wrapperCol={{ span: 14 }}
                          labelCol={{ span: 10 }}
                        >
                          {(fontSize || 0) > 0 && (
                            <SelectOne
                              formItemStyle={{
                                marginBottom: 4,
                              }}
                              label="字号"
                              data={[
                                {
                                  text: '小',
                                  value: 12,
                                },
                                {
                                  text: '中',
                                  value: 16,
                                },
                                {
                                  text: '大',
                                  value: 20,
                                },
                              ]}
                              // oldTheme={false}
                              value={fontSize}
                              setValue={(size) => {
                                setFontSize(size)
                              }}
                            />
                          )}
                          <Form.Item
                            label="全屏"
                            style={{
                              marginBottom: 4,
                            }}
                          >
                            <YakitButton
                              size="small"
                              type="text"
                              icon={<FullscreenOutlined />}
                              onClick={() => {
                                showDrawer({
                                  title: '全屏',
                                  width: '100%',
                                  content: (
                                    <div
                                      style={{
                                        height: '100%',
                                        width: '100%',
                                      }}
                                    >
                                      <NewHTTPPacketEditor {...props} disableFullscreen={true} defaultHeight={670} />
                                    </div>
                                  ),
                                })
                                setPopoverVisible(false)
                              }}
                            />
                          </Form.Item>
                          {(props.language === 'http' || !isResponse) && (
                            <Form.Item
                              label="是否显示换行符"
                              style={{
                                marginBottom: 4,
                                lineHeight: '16px',
                              }}
                            >
                              <YakitSwitch
                                checked={showLineBreaks}
                                onChange={(checked) => {
                                  setRemoteValue(HTTP_PACKET_EDITOR_Line_Breaks, `${checked}`)
                                  setShowLineBreaks(checked)
                                }}
                              />
                            </Form.Item>
                          )}
                        </Form>
                      }
                      onVisibleChange={(v) => {
                        setPopoverVisible(v)
                      }}
                      overlayInnerStyle={{ width: 300 }}
                      visible={popoverVisible}
                    >
                      <YakitButton icon={<SettingOutlined />} type="text" size="small" />
                    </Popover>
                  )}
                </>
              )}
              {props.extraEnd}
            </div>
          )
        }
      >
        <div style={{ flex: 1, overflow: 'hidden' }}>
          {empty && props.emptyOr}
          {mode === 'text' && !empty && (
            <YakitEditor
              theme={props.theme}
              noLineNumber={props.noLineNumber}
              lineNumbersMinChars={props.lineNumbersMinChars}
              noMiniMap={props.noMinimap}
              type={props.language || (isResponse ? 'html' : 'http')}
              value={props.readOnly && showValue.length > 0 ? showValue : strValue}
              readOnly={props.readOnly}
              disabled={props.disabled}
              setValue={setStrValue}
              noWordWrap={noWordwrap}
              fontSize={fontSize}
              showLineBreaks={showLineBreaks}
              noPacketModifier={props.noPacketModifier}
              editorDidMount={(editor) => {
                setMonacoEditor(editor)
              }}
              editorOperationRecord={editorOperationRecord}
              isWebSocket={props.isWebSocket}
              webSocketValue={props.webSocketValue && new Buffer(props.webSocketValue).toString(getEncoding())}
              webSocketToServer={props.webSocketToServer && new Buffer(props.webSocketToServer).toString(getEncoding())}
              webFuzzerCallBack={props.webFuzzerCallBack}
              editorId={editorId}
              {...props.extraEditorProps}
            />
          )}
          {mode === 'hex' && !empty && (
            <HexEditor
              className={classNames({
                [styles['hex-editor-style']]: props.system === 'Windows_NT',
              })}
              showAscii={true}
              data={hexValue}
              showRowLabels={true}
              showColumnLabels={false}
              nonce={nonce}
              onSetValue={props.readOnly ? undefined : handleSetValue}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
