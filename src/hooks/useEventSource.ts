import { useEffect, useRef, useState } from 'react'
import useLoginStore from '@/App/store/loginStore'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { noAuthCode } from '@/utils/axios'
import { message } from 'antd'
import { showErrorMessage } from '@/utils/showErrorMessage'
import { useCreation, useMemoizedFn, useUpdateEffect } from 'ahooks'
import useGetSetState from './useGetSetState'
import {
  clearAIEngineGatewayURL,
  clearAIEngineJWTSecret,
  getAIEngineAuthorizationHeader,
  resolveAIEngineRequestURL,
} from '@/utils/aiEngineAuth'
import { logoutBySessionExpired } from '@/utils/sessionAuth'

interface SSEHooksError {
  msg: string
  code: number
  type: string
}

export interface SSEHookOptions<T> {
  onsuccess?: (data: T) => void
  onerror?: (e: SSEHooksError) => void
  onend?: () => void
  /** 控制是否手动连接(默认: false 自动连接) */
  manual?: boolean
  /** 最大失败重试次数(默认: 5) */
  maxRetries?: number
  /** 是否为AI Agent请求(AI请求头为agent, 默认为api) */
  isAIAgent?: boolean
}

type SSEConnStatusType = 'unlink' | 'link' | 'retry' | 'error'
interface useEventSourceEvents {
  /** 连接SSE中的加载状态 */
  loading: boolean
  /** SSE的连接状态 */
  connStatus: SSEConnStatusType
  /** 连接SSE(可指定目标地址, 如果url不为空, 则target参数不生效) */
  connect: (target?: string) => void
  /** 断开SSE */
  disconnect: () => void
}

/**
 * @param url 连接的目标地址(可传空字符，通过释放的events里connect方法传入指定目标地址)
 */
function useEventSource<T>(url: string, options?: SSEHookOptions<T>): useEventSourceEvents

function useEventSource<T>(url: string, options?: SSEHookOptions<T>) {
  const token = useLoginStore((state) => state.token)

  const retryCountMax = useCreation(() => {
    return options?.maxRetries ?? 5
  }, [options?.maxRetries])

  // SSE加载中状态
  const [loading, setLoading] = useState(true)
  // SSE的连接状态
  const [connStatus, setConnStatus, getConnStatus] = useGetSetState<'unlink' | 'link' | 'retry' | 'error'>('unlink')
  /** SSE实例 */
  const eventSourceRef = useRef<EventSourcePolyfill | null>(null)

  /** 已重试的连接次数 */
  const retryCountRef = useRef(0)

  // 连接方法
  const connect = useMemoizedFn(async (target?: string) => {
    if (!url && !target) {
      showErrorMessage('连接地址不能为空')
      return
    }

    if (eventSourceRef.current || connStatus === 'link') {
      return
    }

    const targetUrl = url || target
    setLoading(true) // 设置为加载中
    retryCountRef.current = 0
    const headers: Record<string, string> = {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    }

    if (options?.isAIAgent) {
      const aiEngineAuthorization = await getAIEngineAuthorizationHeader()
      if (aiEngineAuthorization) {
        headers.Authorization = aiEngineAuthorization
      }
    } else if (token) {
      headers.Authorization = token
    }

    const sourceURL = options?.isAIAgent ? resolveAIEngineRequestURL(`/agent/${targetUrl}`) : `/api/${targetUrl}`

    const es = new EventSourcePolyfill(sourceURL, {
      heartbeatTimeout: 60 * 1000 * 1.5,
      withCredentials: true,
      headers,
    })

    es.onopen = () => {
      setLoading(false) // 连接成功后停止加载
      setConnStatus('link')
    }

    es.onmessage = (e) => {
      if (!eventSourceRef.current) return
      const data = JSON.parse(e.data)
      options?.onsuccess?.(data)
    }

    es.onerror = async (e: any) => {
      const statusText = e.statusText
      const code = e.status
      if (code === noAuthCode) {
        message.destroy()
        setConnStatus('error')
        es.close()
        if (options?.isAIAgent) {
          clearAIEngineGatewayURL()
          clearAIEngineJWTSecret()
          showErrorMessage('AI 引擎鉴权失效，请刷新引擎状态后重试')
        } else {
          await logoutBySessionExpired()
        }
        options?.onend?.()
      } else if (
        code === 500 ||
        code === 501 ||
        code === 505 ||
        (code >= 400 && code <= 499) ||
        (code >= 300 && code <= 399)
      ) {
        message.destroy()
        showErrorMessage('连接异常，请刷新页面后重试')
        setConnStatus('error')
        es.close()
        options?.onend?.()
      } else {
        if (retryCountRef.current >= retryCountMax) {
          showErrorMessage('最大重试次数已达到，停止尝试连接')
          setConnStatus('retry')
          es.close()
          options?.onend?.()
        } else {
          options?.onerror?.({
            msg: statusText,
            code,
            type: e.type,
          })
          // yakitNotify(
          //     'error',
          //     `连接失败: ${statusText}\n准备重试(当前重试次数: ${retryCountRef.current}/${retryCountMax})`,
          // );
        }
        retryCountRef.current += 1
      }
      eventSourceRef.current = null
      setLoading(false) // 连接失败后停止加载
    }

    eventSourceRef.current = es
  })

  // 断开连接方法
  const disconnect = useMemoizedFn(() => {
    setLoading(false) // 停止加载
    setConnStatus('unlink')
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
      options?.onend?.()
    }
  })

  useUpdateEffect(() => {
    if (getConnStatus() === 'link') {
      // token变化后，SSE自动断开连接
      disconnect()
    }
  }, [token])

  // 自动连接或者手动控制连接
  useEffect(() => {
    if (!options?.manual) {
      connect() // 自动连接
    }

    return () => {
      disconnect() // 组件卸载时断开
    }
  }, [options?.manual])

  const events: useEventSourceEvents = useCreation(() => {
    return {
      loading,
      connStatus,
      connect,
      disconnect,
    }
  }, [loading, connStatus])

  return events
}

export default useEventSource
