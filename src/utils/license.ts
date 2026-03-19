const parseLicenseBypassEnv = (value?: string) => {
    if (value === 'true') {
        return true;
    }
    if (value === 'false') {
        return false;
    }
    return undefined;
};

const shouldBypassLicense = () => {
    const bypassFromEnv = parseLicenseBypassEnv(
        import.meta.env.VITE_BYPASS_LICENSE,
    );
    return bypassFromEnv ?? import.meta.env.DEV;
};

const resolveLicenseGateValue = (license?: string) => {
    if (shouldBypassLicense()) {
        return undefined;
    }
    return license?.length ? license : undefined;
};

export { resolveLicenseGateValue, shouldBypassLicense };