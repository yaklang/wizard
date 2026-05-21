import { getLicense } from '@/apis/login'

const parseLicenseBypassEnv = (value?: string) => {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return undefined
}

const shouldBypassLicense = () => {
  const bypassFromEnv = parseLicenseBypassEnv(import.meta.env.VITE_BYPASS_LICENSE)
  return bypassFromEnv ?? import.meta.env.DEV
}

const resolveLicenseGateValue = (license?: string) => {
  if (shouldBypassLicense()) {
    return undefined
  }
  return license?.length ? license : undefined
}

/** 未激活时返回 License 申请码；已激活或 bypass 时返回 undefined */
const fetchLicenseGateValue = async (): Promise<string | undefined> => {
  if (shouldBypassLicense()) {
    return undefined
  }

  const res = await getLicense()
  if (!res?.data) {
    return undefined
  }

  const { license } = res.data
  return resolveLicenseGateValue(license)
}

export { resolveLicenseGateValue, shouldBypassLicense, fetchLicenseGateValue }
