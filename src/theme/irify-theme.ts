// IRify Dark Theme Configuration for Ant Design
// Cybersecurity-inspired color palette with glowing accents

import type { ThemeConfig } from 'antd';

export const irifyTheme: ThemeConfig = {
    token: {
        // Primary accent - Electric cyan
        colorPrimary: '#00D9FF',
        colorPrimaryHover: '#33E1FF',
        colorPrimaryActive: '#00B8D9',

        // Background colors - Deep navy/charcoal
        colorBgBase: '#0D1117',
        colorBgContainer: '#161B22',
        colorBgElevated: '#21262D',
        colorBgLayout: '#0D1117',
        colorBgSpotlight: '#1F6FEB20',

        // Text colors
        colorText: '#E6EDF3',
        colorTextSecondary: '#8B949E',
        colorTextTertiary: '#6E7681',
        colorTextQuaternary: '#484F58',

        // Border colors
        colorBorder: '#30363D',
        colorBorderSecondary: '#21262D',

        // Status colors
        colorSuccess: '#3FB950',
        colorWarning: '#D29922',
        colorError: '#F85149',
        colorInfo: '#58A6FF',

        // Border radius
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 6,

        // Font
        fontFamily:
            "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        fontFamilyCode: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    },
    components: {
        Layout: {
            siderBg: '#0D1117',
            headerBg: '#161B22',
            bodyBg: '#0D1117',
            triggerBg: '#21262D',
            triggerColor: '#E6EDF3',
        },
        Menu: {
            darkItemBg: '#0D1117',
            darkSubMenuItemBg: '#161B22',
            darkItemSelectedBg: '#1F6FEB30',
            darkItemSelectedColor: '#00D9FF',
            darkItemHoverBg: '#21262D',
            darkItemColor: '#8B949E',
            itemMarginInline: 8,
            itemBorderRadius: 8,
        },
        Card: {
            colorBgContainer: '#161B22',
            colorBorderSecondary: '#30363D',
        },
        Table: {
            colorBgContainer: '#161B22',
            headerBg: '#21262D',
            headerColor: '#E6EDF3',
            rowHoverBg: '#1F6FEB15',
            borderColor: '#30363D',
        },
        Button: {
            primaryShadow: '0 0 12px rgba(0, 217, 255, 0.4)',
            defaultBorderColor: '#30363D',
            defaultColor: '#E6EDF3',
            defaultBg: '#21262D',
        },
        Input: {
            colorBgContainer: '#0D1117',
            colorBorder: '#30363D',
            hoverBorderColor: '#00D9FF',
            activeBorderColor: '#00D9FF',
        },
        Select: {
            colorBgContainer: '#0D1117',
            colorBorder: '#30363D',
            optionSelectedBg: '#1F6FEB30',
        },
        Modal: {
            contentBg: '#161B22',
            headerBg: '#161B22',
            footerBg: '#161B22',
        },
        Drawer: {
            colorBgElevated: '#161B22',
        },
        Tag: {
            defaultBg: '#21262D',
            defaultColor: '#E6EDF3',
        },
        Tooltip: {
            colorBgSpotlight: '#21262D',
        },
        Progress: {
            defaultColor: '#00D9FF',
        },
        Steps: {
            colorPrimary: '#00D9FF',
        },
    },
};

// Severity color mapping for vulnerabilities
export const severityColors = {
    critical: '#FF4D4F',
    high: '#FF7A45',
    middle: '#FFC53D',
    warning: '#FADB14',
    low: '#52C41A',
    info: '#1890FF',
};

// Status colors for scans
export const scanStatusColors = {
    running: '#00D9FF',
    success: '#3FB950',
    failed: '#F85149',
    pending: '#8B949E',
    cancelled: '#6E7681',
};

export default irifyTheme;
