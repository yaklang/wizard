const AI_ENGINE_JWT_SECRET_STORAGE_KEY = 'ai-engine-jwt-secret'
const AI_ENGINE_GATEWAY_URL_STORAGE_KEY = 'ai-engine-gateway-url'
const AI_ENGINE_ROUTE_PREFIX_STORAGE_KEY = 'ai-engine-route-prefix'
const AI_ENGINE_JWT_TTL_SECONDS = 24 * 60 * 60
const AI_ENGINE_JWT_REFRESH_BUFFER_MS = 60 * 1000

let cachedSecret = ''
let cachedToken = ''
let cachedExpireAt = 0

interface AIEngineStatusLike {
  gateway_url?: string
  jwt_secret?: string
  route_prefix?: string
  running?: boolean
}

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'

const encodeText = (value: string) => new TextEncoder().encode(value)

const bytesToBase64 = (bytes: Uint8Array): string => {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  if (typeof globalThis.btoa === 'function') {
    return globalThis.btoa(binary)
  }

  return Buffer.from(bytes).toString('base64')
}

const toBase64Url = (value: string | Uint8Array) => {
  const bytes = typeof value === 'string' ? encodeText(value) : value

  return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const clearAIEngineJWTCache = () => {
  cachedSecret = ''
  cachedToken = ''
  cachedExpireAt = 0
}

const getStoredAIEngineJWTSecret = () => {
  if (!isBrowser()) return ''

  return window.localStorage.getItem(AI_ENGINE_JWT_SECRET_STORAGE_KEY) || ''
}

export const hasAIEngineJWTSecret = () => !!getStoredAIEngineJWTSecret()

const normalizeGatewayURL = (gatewayURL?: string | null) => gatewayURL?.trim().replace(/\/+$/, '') || ''
const normalizeRoutePrefix = (routePrefix?: string | null) => {
  const normalizedRoutePrefix = routePrefix?.trim() || '/agent'
  if (normalizedRoutePrefix === '/') return '/'

  return `/${normalizedRoutePrefix.replace(/^\/+/, '').replace(/\/+$/, '')}`
}

export const getStoredAIEngineGatewayURL = () => {
  if (!isBrowser()) return ''

  return normalizeGatewayURL(window.localStorage.getItem(AI_ENGINE_GATEWAY_URL_STORAGE_KEY))
}

export const getStoredAIEngineRoutePrefix = () => {
  if (!isBrowser()) return '/agent'

  return normalizeRoutePrefix(window.localStorage.getItem(AI_ENGINE_ROUTE_PREFIX_STORAGE_KEY))
}

export const setAIEngineGatewayURL = (gatewayURL?: string | null) => {
  const normalizedGatewayURL = normalizeGatewayURL(gatewayURL)

  if (!isBrowser()) return

  if (!normalizedGatewayURL) {
    window.localStorage.removeItem(AI_ENGINE_GATEWAY_URL_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AI_ENGINE_GATEWAY_URL_STORAGE_KEY, normalizedGatewayURL)
}

export const setAIEngineRoutePrefix = (routePrefix?: string | null) => {
  if (!isBrowser()) return

  window.localStorage.setItem(AI_ENGINE_ROUTE_PREFIX_STORAGE_KEY, normalizeRoutePrefix(routePrefix))
}

export const setAIEngineJWTSecret = (secret?: string | null) => {
  const normalizedSecret = secret?.trim() || ''

  clearAIEngineJWTCache()

  if (!isBrowser()) return

  if (!normalizedSecret) {
    window.localStorage.removeItem(AI_ENGINE_JWT_SECRET_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(AI_ENGINE_JWT_SECRET_STORAGE_KEY, normalizedSecret)
}

export const clearAIEngineJWTSecret = () => {
  setAIEngineJWTSecret('')
}

export const clearAIEngineGatewayURL = () => {
  setAIEngineGatewayURL('')
}

export const clearAIEngineRoutePrefix = () => {
  if (!isBrowser()) return

  window.localStorage.removeItem(AI_ENGINE_ROUTE_PREFIX_STORAGE_KEY)
}

export const syncAIEngineAuth = <T extends AIEngineStatusLike | null | undefined>(status: T): T => {
  if (!status) return status

  if (status.running) {
    if (status.jwt_secret?.trim()) {
      setAIEngineJWTSecret(status.jwt_secret)
    }
    if (status.gateway_url?.trim()) {
      setAIEngineGatewayURL(status.gateway_url)
    }
    setAIEngineRoutePrefix(status.route_prefix)
    return status
  }

  if (status.running === false) {
    clearAIEngineJWTSecret()
    clearAIEngineGatewayURL()
    clearAIEngineRoutePrefix()
  }

  return status
}

const signAIEngineJWT = async (secret: string) => {
  if (!globalThis.crypto?.subtle) {
    throw new Error('当前环境不支持 AI 引擎 JWT 生成')
  }

  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = {
    iss: 'ai-agent-gateway',
    iat: now,
    exp: now + AI_ENGINE_JWT_TTL_SECONDS,
  }

  const encodedHeader = toBase64Url(JSON.stringify(header))
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signingInput = `${encodedHeader}.${encodedPayload}`

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    encodeText(secret),
    {
      name: 'HMAC',
      hash: 'SHA-256',
    },
    false,
    ['sign'],
  )

  const signature = await globalThis.crypto.subtle.sign('HMAC', key, encodeText(signingInput))

  return {
    token: `${signingInput}.${toBase64Url(new Uint8Array(signature))}`,
    expireAt: (now + AI_ENGINE_JWT_TTL_SECONDS) * 1000,
  }
}

const getURLPathname = (url?: string) => {
  if (!url) return ''

  try {
    const base = isBrowser() ? window.location.origin : 'http://localhost'
    return new URL(url, base).pathname
  } catch {
    return url
  }
}

export const isAIEnginePath = (url?: string) => /^\/agent(?:\/|$)/.test(getURLPathname(url))

const joinURLPath = (prefix: string, suffix: string) => {
  const normalizedPrefix = prefix === '/' ? '' : prefix.replace(/\/+$/, '')
  const normalizedSuffix = suffix ? `/${suffix.replace(/^\/+/, '')}` : ''

  return `${normalizedPrefix}${normalizedSuffix}` || '/'
}

export const resolveAIEngineRequestURL = (url?: string) => {
  if (!url || !isAIEnginePath(url)) return url || ''

  const gatewayURL = getStoredAIEngineGatewayURL()
  if (!gatewayURL) return url

  try {
    const requestURL = new URL(url, isBrowser() ? window.location.origin : 'http://localhost')
    const targetURL = new URL(gatewayURL)
    const routePrefix = getStoredAIEngineRoutePrefix()
    const gatewayPathname = targetURL.pathname.replace(/\/+$/, '') || '/'
    const requestPathname = requestURL.pathname
    const suffix = requestPathname.startsWith(routePrefix) ? requestPathname.slice(routePrefix.length) : requestPathname
    const gatewayContainsRoutePrefix = gatewayPathname === routePrefix || gatewayPathname.endsWith(routePrefix)

    targetURL.pathname = joinURLPath(gatewayPathname, gatewayContainsRoutePrefix ? suffix : requestPathname)
    targetURL.search = requestURL.search

    return targetURL.toString()
  } catch {
    return url
  }
}

export const getAIEngineAuthorizationHeader = async () => {
  const secret = getStoredAIEngineJWTSecret()
  if (!secret) return ''

  if (secret === cachedSecret && cachedToken && Date.now() < cachedExpireAt - AI_ENGINE_JWT_REFRESH_BUFFER_MS) {
    return `Bearer ${cachedToken}`
  }

  const signed = await signAIEngineJWT(secret)
  cachedSecret = secret
  cachedToken = signed.token
  cachedExpireAt = signed.expireAt

  return `Bearer ${signed.token}`
}
