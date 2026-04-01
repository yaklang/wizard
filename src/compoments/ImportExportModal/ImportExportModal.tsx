import { memo, useEffect, useMemo, useRef } from 'react'
import { YakitButton } from '@/compoments/YakitUI/YakitButton/YakitButton'
import { YakitModal, type YakitModalProp } from '@/compoments/yakitUI/YakitModal/YakitModal'
import type { LogListInfo } from '@/compoments/YakitUploadModal/YakitUploadModal'
import { ImportAndExportStatusInfo } from '@/compoments/YakitUploadModal/YakitUploadModal'
import { yakitNotify } from '@/utils/notification'
import { useMemoizedFn, useSafeState } from 'ahooks'
import { Form, type FormInstance, type FormProps } from 'antd'
import styles from './ImportExportModal.module.scss'
import { postAiforgeExport, postAiforgeImport } from '@/apis/AiEventApi'
import type {
  ExportAIForgeRequest,
  ExportImportAIForgeProgress,
  ImportAIForgeRequest,
} from '@/pages/AIAgent/ai-agent/forgeName/type'

// const { ipcRenderer } = window.require('electron');

const ImportExportModalSize = {
  export: {
    width: 520,
    labelCol: 5,
    wrapperCol: 18,
  },
  import: {
    width: 720,
    labelCol: 6,
    wrapperCol: 17,
  },
}

type IsProgressFinished<P> = (progress: P) => boolean
type GetProgressValue<P> = (progress: P) => number

export type ImportExportModalExtra = {
  hint: boolean
} & {
  title: string
  type: 'export' | 'import'
  apiKey: string
}
interface ImportExportModalProps<F, R, P> {
  getContainer?: HTMLElement
  extra: ImportExportModalExtra
  hasDesc?: boolean
  modelProps?: YakitModalProp
  formProps?: FormProps
  renderForm: (form: FormInstance) => React.ReactNode
  onBeforeSubmit?: (values: F) => Promise<void> | void
  onSubmitForm: (values: F) => R
  getProgressValue: GetProgressValue<P>
  isProgressFinished: IsProgressFinished<P>
  getlogListInfo?: (stream: P[]) => LogListInfo[]
  onFinished: (result: boolean) => void
}
/**
 * 通用导入导出组件，参考ForgeName组件
 */
const ImportExportModalInner = <F, R, P>(props: ImportExportModalProps<F, R, P>) => {
  const {
    getContainer,
    extra,
    hasDesc = true,
    modelProps = {},
    formProps = {},
    renderForm,
    onBeforeSubmit,
    onSubmitForm,
    getProgressValue,
    isProgressFinished,
    getlogListInfo,
    onFinished,
  } = props

  const [form] = Form.useForm()

  const abortControllerRef = useRef<AbortController>()
  const [showProgressStream, setShowProgressStream] = useSafeState(false)
  const importExportStreamRef = useRef<P[]>([])
  const [progressStream, setProgressStream] = useSafeState<P[]>([])

  const handleReset = useMemoizedFn(() => {
    abortControllerRef.current = undefined
    setShowProgressStream(false)
    importExportStreamRef.current = []
    setProgressStream([])
  })

  const onSubmit = useMemoizedFn(async () => {
    try {
      const values = form.getFieldsValue() as F
      await onBeforeSubmit?.(values)
      const params = onSubmitForm(values)

      importExportStreamRef.current = []
      setProgressStream([])
      setShowProgressStream(true)

      const controller = new AbortController()
      abortControllerRef.current = controller

      const handleProgress = (progress: ExportImportAIForgeProgress) => {
        importExportStreamRef.current.unshift(progress as unknown as P)
        setProgressStream([...importExportStreamRef.current])
      }

      if (extra.type === 'export') {
        await postAiforgeExport(params as unknown as ExportAIForgeRequest, handleProgress, controller.signal)
      } else {
        await postAiforgeImport(params as unknown as ImportAIForgeRequest, handleProgress, controller.signal)
      }
    } catch (e) {
      if ((e as Error)?.name !== 'AbortError') {
        yakitNotify('error', `[${extra.apiKey}] error:  ${e}`)
      }
    }
  })

  const onCancelStream = useMemoizedFn(() => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = undefined
  })

  useEffect(() => {
    if (progressStream.length && isProgressFinished(progressStream[0])) {
      onFinished(true)
    }
  }, [progressStream.length])
  const streamData = useMemo(() => {
    return {
      Progress: progressStream.length ? getProgressValue(progressStream[0]) : 0,
    }
  }, [progressStream.length])
  const logListInfo = useMemo(() => {
    return getlogListInfo?.(progressStream) || []
  }, [progressStream.length])
  const progressTitle = useMemo(() => {
    return extra.type === 'export'
      ? progressStream.length
        ? isProgressFinished(progressStream[0])
          ? '导出完成'
          : '导出中...'
        : '导出中...'
      : progressStream.length
        ? isProgressFinished(progressStream[0])
          ? '导入完成'
          : '导入中...'
        : '导入中...'
  }, [extra.type, progressStream.length])

  const onCancel = useMemoizedFn(() => {
    onFinished(false)
  })

  // modal header 描述文字
  const exportDescribeMemoizedFn = useMemoizedFn((type) => {
    if (!hasDesc) return null
    switch (type) {
      case 'export':
        return (
          <div className={styles['export-hint']}>
            远程模式下导出后请打开~Yakit\yakit-projects\projects路径查看导出文件，文件名无需填写后缀
          </div>
        )
      case 'import':
        return (
          <div className={styles['import-hint']}>
            导入外部资源存在潜在风险，可能会被植入恶意代码或Payload，造成数据泄露、系统被入侵等严重后果。请务必谨慎考虑引入外部资源的必要性，并确保资源来源可信、内容安全。如果确实需要使用外部资源，建议优先选择官方发布的安全版本，或自行编写可控的数据源。同时，请保持系统和软件的最新版本，及时修复已知漏洞，做好日常安全防护。
          </div>
        )

      default:
        break
    }
  })

  useEffect(() => {
    if (extra.hint) {
      handleReset()
      form.resetFields()
    }
    // 关闭时重置所有数据
    return () => {
      if (extra.hint) {
        onCancelStream()
      }
    }
  }, [extra.hint])

  return (
    <YakitModal
      getContainer={getContainer}
      type="white"
      width={ImportExportModalSize[extra.type].width}
      centered={true}
      keyboard={false}
      maskClosable={false}
      visible={extra.hint}
      title={extra.title}
      bodyStyle={{ padding: 0 }}
      {...modelProps}
      onCancel={() => {
        onCancelStream()
        onCancel()
      }}
      footerStyle={{ justifyContent: 'flex-end' }}
      footer={
        !showProgressStream ? (
          <>
            {extra.type === 'export' && (
              <YakitButton type="outline2" onClick={onCancel} style={{ marginRight: 8 }}>
                取消
              </YakitButton>
            )}
            <YakitButton onClick={onSubmit}>{extra.type === 'import' ? '导入' : '确定'}</YakitButton>
          </>
        ) : (
          <YakitButton
            type="outline2"
            onClick={() => {
              onCancelStream()
              onCancel()
            }}
          >
            {progressStream.length ? (isProgressFinished(progressStream[0]) ? '完成' : '取消') : '取消'}
          </YakitButton>
        )
      }
    >
      {!showProgressStream ? (
        <div className={styles['import-export-modal']}>
          <Form
            form={form}
            layout="horizontal"
            labelCol={{
              span: ImportExportModalSize[extra.type].labelCol,
            }}
            wrapperCol={{
              span: ImportExportModalSize[extra.type].wrapperCol,
            }}
            {...formProps}
            onSubmitCapture={(e) => {
              e.preventDefault()
            }}
          >
            {exportDescribeMemoizedFn(extra.type)}
            {renderForm(form)}
          </Form>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          <ImportAndExportStatusInfo
            title={progressTitle}
            showDownloadDetail={false}
            streamData={streamData}
            logListInfo={logListInfo}
          />
        </div>
      )}
    </YakitModal>
  )
}
const ImportExportModal = memo(<F, R, P>(props: ImportExportModalProps<F, R, P>) => (
  <ImportExportModalInner {...props} />
)) as <F, R, P>(props: ImportExportModalProps<F, R, P>) => JSX.Element

export default ImportExportModal
