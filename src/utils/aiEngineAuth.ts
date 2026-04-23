const AI_ENGINE_JWT_SECRET_STORAGE_KEY = 'ai-engine-jwt-secret'
const AI_ENGINE_LEGACY_GATEWAY_URL_STORAGE_KEY = 'ai-engine-gateway-url'
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

const concatBytes = (...chunks: Uint8Array[]) => {
  const totalLength = chunks.reduce((length, chunk) => length + chunk.length, 0)
  const bytes = new Uint8Array(totalLength)
  let offset = 0

  chunks.forEach((chunk) => {
    bytes.set(chunk, offset)
    offset += chunk.length
  })

  return bytes
}

const rightRotate = (value: number, bits: number) => (value >>> bits) | (value << (32 - bits))

const sha256 = (message: Uint8Array) => {
  const constants = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98,
    0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8,
    0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819,
    0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ])
  const hash = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ])
  const paddedLength = Math.ceil((message.length + 9) / 64) * 64
  const padded = new Uint8Array(paddedLength)
  const words = new Uint32Array(64)
  const bitLength = message.length * 8

  padded.set(message)
  padded[message.length] = 0x80
  padded[paddedLength - 8] = Math.floor(bitLength / 0x100000000) >>> 24
  padded[paddedLength - 7] = Math.floor(bitLength / 0x100000000) >>> 16
  padded[paddedLength - 6] = Math.floor(bitLength / 0x100000000) >>> 8
  padded[paddedLength - 5] = Math.floor(bitLength / 0x100000000)
  padded[paddedLength - 4] = bitLength >>> 24
  padded[paddedLength - 3] = bitLength >>> 16
  padded[paddedLength - 2] = bitLength >>> 8
  padded[paddedLength - 1] = bitLength

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index += 1) {
      const wordOffset = offset + index * 4
      words[index] =
        ((padded[wordOffset] << 24) |
          (padded[wordOffset + 1] << 16) |
          (padded[wordOffset + 2] << 8) |
          padded[wordOffset + 3]) >>>
        0
    }

    for (let index = 16; index < 64; index += 1) {
      const s0 = rightRotate(words[index - 15], 7) ^ rightRotate(words[index - 15], 18) ^ (words[index - 15] >>> 3)
      const s1 = rightRotate(words[index - 2], 17) ^ rightRotate(words[index - 2], 19) ^ (words[index - 2] >>> 10)
      words[index] = (words[index - 16] + s0 + words[index - 7] + s1) >>> 0
    }

    let a = hash[0]
    let b = hash[1]
    let c = hash[2]
    let d = hash[3]
    let e = hash[4]
    let f = hash[5]
    let g = hash[6]
    let h = hash[7]

    for (let index = 0; index < 64; index += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)
      const choice = (e & f) ^ (~e & g)
      const temp1 = (h + s1 + choice + constants[index] + words[index]) >>> 0
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)
      const majority = (a & b) ^ (a & c) ^ (b & c)
      const temp2 = (s0 + majority) >>> 0

      h = g
      g = f
      f = e
      e = (d + temp1) >>> 0
      d = c
      c = b
      b = a
      a = (temp1 + temp2) >>> 0
    }

    hash[0] = (hash[0] + a) >>> 0
    hash[1] = (hash[1] + b) >>> 0
    hash[2] = (hash[2] + c) >>> 0
    hash[3] = (hash[3] + d) >>> 0
    hash[4] = (hash[4] + e) >>> 0
    hash[5] = (hash[5] + f) >>> 0
    hash[6] = (hash[6] + g) >>> 0
    hash[7] = (hash[7] + h) >>> 0
  }

  const bytes = new Uint8Array(32)
  hash.forEach((word, index) => {
    bytes[index * 4] = word >>> 24
    bytes[index * 4 + 1] = word >>> 16
    bytes[index * 4 + 2] = word >>> 8
    bytes[index * 4 + 3] = word
  })

  return bytes
}

const hmacSha256 = (secret: Uint8Array, message: Uint8Array) => {
  const blockSize = 64
  const key = new Uint8Array(blockSize)
  const normalizedSecret = secret.length > blockSize ? sha256(secret) : secret
  const outerPadding = new Uint8Array(blockSize)
  const innerPadding = new Uint8Array(blockSize)

  key.set(normalizedSecret)

  for (let index = 0; index < blockSize; index += 1) {
    outerPadding[index] = key[index] ^ 0x5c
    innerPadding[index] = key[index] ^ 0x36
  }

  return sha256(concatBytes(outerPadding, sha256(concatBytes(innerPadding, message))))
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

const normalizeRoutePrefix = (routePrefix?: string | null) => {
  const normalizedRoutePrefix = routePrefix?.trim() || '/agent'
  if (normalizedRoutePrefix === '/') return '/'

  return `/${normalizedRoutePrefix.replace(/^\/+/, '').replace(/\/+$/, '')}`
}

export const getStoredAIEngineGatewayURL = () => {
  return ''
}

export const getStoredAIEngineRoutePrefix = () => {
  if (!isBrowser()) return '/agent'

  return normalizeRoutePrefix(window.localStorage.getItem(AI_ENGINE_ROUTE_PREFIX_STORAGE_KEY))
}

export const setAIEngineGatewayURL = (_gatewayURL?: string | null) => {
  if (!isBrowser()) return
  window.localStorage.removeItem(AI_ENGINE_LEGACY_GATEWAY_URL_STORAGE_KEY)
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
    clearAIEngineGatewayURL()
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
  const signingInputBytes = encodeText(signingInput)

  let signatureBytes: Uint8Array

  if (globalThis.crypto?.subtle) {
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

    signatureBytes = new Uint8Array(await globalThis.crypto.subtle.sign('HMAC', key, signingInputBytes))
  } else {
    signatureBytes = hmacSha256(encodeText(secret), signingInputBytes)
  }

  return {
    token: `${signingInput}.${toBase64Url(signatureBytes)}`,
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

export const resolveAIEngineRequestURL = (url?: string) => {
  if (!url || !isAIEnginePath(url)) return url || ''
  return url
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
