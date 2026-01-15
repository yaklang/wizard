import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';
import { ConfigProvider, theme as antdTheme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { irifyTheme } from './irify-theme';

// Theme mode types
type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
    isIRify: boolean;
    isDark: boolean;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    isIRify: false,
    isDark: false,
    themeMode: 'system',
    setThemeMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
    children: React.ReactNode;
}

const THEME_STORAGE_KEY = 'irify-theme-mode';
const APP_MODE = import.meta.env.VITE_APP_MODE;

// Detect system preference
const getSystemPreference = (): boolean => {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true; // Default to dark for IRify
};

// Get stored theme mode
const getStoredThemeMode = (): ThemeMode => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
            return stored;
        }
    }
    return 'system';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const isIRify = APP_MODE === 'irify';
    const [themeMode, setThemeModeState] =
        useState<ThemeMode>(getStoredThemeMode);
    const [systemIsDark, setSystemIsDark] = useState(getSystemPreference);

    // Listen for system preference changes
    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    // Persist theme mode
    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, mode);
        }
    }, []);

    // Calculate if dark mode is active
    const isDark = useMemo(() => {
        if (!isIRify) return false; // Original product always light
        if (themeMode === 'system') return systemIsDark;
        return themeMode === 'dark';
    }, [isIRify, themeMode, systemIsDark]);

    // Apply body class for global styles
    useEffect(() => {
        if (isIRify) {
            document.body.classList.add('irify-app');
            document.body.classList.toggle('irify-dark', isDark);
            document.body.classList.toggle('irify-light', !isDark);
        }
        return () => {
            document.body.classList.remove(
                'irify-app',
                'irify-dark',
                'irify-light',
            );
        };
    }, [isIRify, isDark]);

    const themeConfig = useMemo(() => {
        if (isIRify) {
            if (isDark) {
                return {
                    ...irifyTheme,
                    algorithm: antdTheme.darkAlgorithm,
                };
            } else {
                // Light mode for IRify
                return {
                    token: {
                        colorPrimary: '#4F46E5',
                        colorBgBase: '#F8FAFC',
                        colorBgContainer: '#FFFFFF',
                        colorBgElevated: '#FFFFFF',
                        colorBgLayout: '#F1F5F9',
                        colorText: '#1E293B',
                        colorTextSecondary: '#64748B',
                        colorBorder: '#E2E8F0',
                        borderRadius: 8,
                    },
                    algorithm: antdTheme.defaultAlgorithm,
                };
            }
        }
        // Original light theme - use Ant Design defaults
        return {};
    }, [isIRify, isDark]);

    const contextValue = useMemo(
        () => ({
            isIRify,
            isDark,
            themeMode,
            setThemeMode,
        }),
        [isIRify, isDark, themeMode, setThemeMode],
    );

    return (
        <ThemeContext.Provider value={contextValue}>
            <ConfigProvider theme={themeConfig} locale={zhCN}>
                {children}
            </ConfigProvider>
        </ThemeContext.Provider>
    );
};

export default ThemeProvider;
