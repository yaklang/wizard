import React, { useMemo, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Tooltip, Avatar, Dropdown, Spin, Switch } from 'antd';
import type { MenuProps } from 'antd';
import { useRequest, useSafeState } from 'ahooks';
import {
    DashboardOutlined,
    FolderOutlined,
    BugOutlined,
    ThunderboltOutlined,
    SettingOutlined,
    LogoutOutlined,
    UserOutlined,
    SunOutlined,
    MoonOutlined,
} from '@ant-design/icons';
import { getLicense } from '@/apis/login';
import { useNetworkStatus } from '@/hooks';
import useLoginStore from '@/App/store/loginStore';
import { useTheme } from '@/theme';

import './IRifyLayout.scss';

const { Sider, Content } = Layout;

// Navigation items for IRify - Chinese labels
const mainNavItems = [
    {
        key: '/',
        icon: <DashboardOutlined />,
        label: '工作台',
        path: '/',
    },
    {
        key: '/projects',
        icon: <FolderOutlined />,
        label: '项目管理',
        path: '/projects',
    },
    {
        key: '/vulnerabilities',
        icon: <BugOutlined />,
        label: '漏洞管理',
        path: '/vulnerabilities',
    },
    {
        key: '/scans',
        icon: <ThunderboltOutlined />,
        label: '扫描任务',
        path: '/scans',
    },
];

const settingsNavItems = [
    {
        key: '/settings/rules',
        label: '规则管理',
        path: '/settings/rules',
    },
    {
        key: '/settings/nodes',
        label: '节点管理',
        path: '/settings/nodes',
    },
    {
        key: '/settings/users',
        label: '用户管理',
        path: '/settings/users',
    },
    {
        key: '/settings/reports',
        label: '报告管理',
        path: '/settings/reports',
    },
];

const IRifyLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { status } = useNetworkStatus();
    const store = useLoginStore.getState();
    const [collapsed, setCollapsed] = useSafeState(false);
    const { isDark, themeMode, setThemeMode } = useTheme();

    const { data: license, loading } = useRequest(async () => {
        const { data } = await getLicense();
        const { license } = data;
        return license?.length > 0 ? license : undefined;
    });

    // Check network status
    useEffect(() => {
        !status && navigate('/network-err', { replace: true });
    }, [status]);

    // Check license
    useEffect(() => {
        license && navigate('/license', { state: { license } });
    }, [license]);

    // Get current selected key
    const selectedKey = useMemo(() => {
        const path = location.pathname;
        // Match main nav items
        for (const item of mainNavItems) {
            if (
                path === item.path ||
                (item.path !== '/' && path.startsWith(item.path))
            ) {
                return item.key;
            }
        }
        // Match settings items
        for (const item of settingsNavItems) {
            if (path.startsWith(item.path)) {
                return '/settings';
            }
        }
        return '/';
    }, [location.pathname]);

    // Handle navigation
    const handleNavClick = (path: string) => {
        navigate(path);
    };

    // Theme toggle handler
    const handleThemeToggle = () => {
        if (themeMode === 'dark') {
            setThemeMode('light');
        } else if (themeMode === 'light') {
            setThemeMode('system');
        } else {
            setThemeMode('dark');
        }
    };

    // Get theme label
    const getThemeLabel = () => {
        if (themeMode === 'system') return '跟随系统';
        if (themeMode === 'dark') return '深色模式';
        return '浅色模式';
    };

    // User dropdown menu
    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '个人资料',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
            danger: true,
            onClick: () => store.outLogin(),
        },
    ];

    // Settings dropdown menu
    const settingsMenuItems: MenuProps['items'] = [
        ...settingsNavItems.map((item) => ({
            key: item.key,
            label: item.label,
            onClick: () => handleNavClick(item.path),
        })),
        { type: 'divider' as const },
        {
            key: 'theme',
            label: (
                <div
                    className="theme-toggle-item"
                    onClick={(e) => e.stopPropagation()}
                >
                    <span>{getThemeLabel()}</span>
                    <Switch
                        size="small"
                        checked={isDark}
                        onChange={() => handleThemeToggle()}
                        checkedChildren={<MoonOutlined />}
                        unCheckedChildren={<SunOutlined />}
                    />
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <Spin spinning={loading} tip="加载中...">
                <div
                    style={{
                        height: '100vh',
                        background: isDark ? '#0D1117' : '#F8FAFC',
                    }}
                />
            </Spin>
        );
    }

    return (
        <Layout className={`irify-layout ${isDark ? 'dark' : 'light'}`}>
            <Sider
                className="irify-layout-sider"
                width={collapsed ? 72 : 200}
                collapsible
                collapsed={collapsed}
                trigger={null}
                onMouseEnter={() => setCollapsed(false)}
                onMouseLeave={() => setCollapsed(true)}
            >
                {/* Logo */}
                <div className="irify-logo" onClick={() => navigate('/')}>
                    <span className="logo-bracket">[</span>
                    <span className="logo-text">IR</span>
                    <span className="logo-bracket">]</span>
                    {!collapsed && <span className="logo-name">ify</span>}
                </div>

                {/* Main Navigation */}
                <nav className="irify-nav">
                    {mainNavItems.map((item) => (
                        <Tooltip
                            key={item.key}
                            title={collapsed ? item.label : ''}
                            placement="right"
                        >
                            <div
                                className={`irify-nav-item ${selectedKey === item.key ? 'active' : ''}`}
                                onClick={() => handleNavClick(item.path)}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                {!collapsed && (
                                    <span className="nav-label">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </Tooltip>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="irify-sider-footer">
                    {/* Settings */}
                    <Dropdown
                        menu={{ items: settingsMenuItems }}
                        placement="topRight"
                        trigger={['click']}
                    >
                        <Tooltip
                            title={collapsed ? '设置' : ''}
                            placement="right"
                        >
                            <div
                                className={`irify-nav-item ${selectedKey === '/settings' ? 'active' : ''}`}
                            >
                                <span className="nav-icon">
                                    <SettingOutlined />
                                </span>
                                {!collapsed && (
                                    <span className="nav-label">设置</span>
                                )}
                            </div>
                        </Tooltip>
                    </Dropdown>

                    {/* User */}
                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement="topRight"
                        trigger={['click']}
                    >
                        <div className="irify-user-card">
                            <Avatar size={32} icon={<UserOutlined />} />
                            {!collapsed && (
                                <div className="user-info">
                                    <span className="user-name">管理员</span>
                                </div>
                            )}
                        </div>
                    </Dropdown>
                </div>
            </Sider>

            <Content className="irify-layout-content">
                <Outlet />
            </Content>
        </Layout>
    );
};

export default IRifyLayout;
