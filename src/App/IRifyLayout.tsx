import React, { useMemo, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Tooltip, Avatar, Dropdown, Spin } from 'antd';
import type { MenuProps } from 'antd';
import { useRequest, useSafeState } from 'ahooks';
import {
    DashboardOutlined,
    FolderOutlined,
    ThunderboltOutlined,
    LogoutOutlined,
    UserOutlined,
    SunOutlined,
    MoonOutlined,
    FileTextOutlined,
    ControlOutlined,
    AppstoreOutlined,
    DownOutlined,
    RightOutlined,
    NodeIndexOutlined,
    SafetyCertificateOutlined,
    BugOutlined,
} from '@ant-design/icons';
import { SiderClose, SiderOpen } from '@/assets/compoments';
import { getLicense } from '@/apis/login';
import { useNetworkStatus } from '@/hooks';
import useLoginStore from '@/App/store/loginStore';
import { useTheme } from '@/theme';

import './IRifyLayout.scss';

const { Sider, Content } = Layout;

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
    {
        key: '/rules',
        icon: <SafetyCertificateOutlined />,
        label: '规则管理',
        path: '/rules',
    },
];

const collapsibleNavItems = [
    {
        key: '/task',
        icon: <AppstoreOutlined />,
        label: '任务中心',
        children: [
            {
                key: '/task/new-create-task',
                label: '新建扫描',
                path: '/task/new-create-task',
            },
            {
                key: '/task/special-task',
                label: '专项扫描',
                path: '/task/special-task',
            },
            {
                key: '/task/task-list',
                label: '任务列表',
                path: '/task/task-list',
            },
        ],
    },
    {
        key: '/reports',
        icon: <FileTextOutlined />,
        label: '报告管理',
        path: '/reports',
    },
    {
        key: '/node-config',
        icon: <ControlOutlined />,
        label: '节点配置',
        children: [
            {
                key: '/node-config/install',
                label: '节点安装',
                path: '/node-config/install',
            },
            {
                key: '/node-config/manage',
                label: '节点管理',
                path: '/node-config/manage',
            },
        ],
    },
    {
        key: '/system-management',
        icon: <NodeIndexOutlined />,
        label: '系统管理',
        children: [
            {
                key: '/system-management/userinfo',
                label: '用户管理',
                path: '/system-management/userinfo',
            },
            {
                key: '/system-management/task-script',
                label: '脚本管理',
                path: '/system-management/task-script',
            },
            {
                key: '/system-management/cve-loophole',
                label: '漏洞库管理',
                path: '/system-management/cve-loophole',
            },
            {
                key: '/system-management/global-reverse-link',
                label: '全局反连',
                path: '/system-management/global-reverse-link',
            },
        ],
    },
];

const IRifyLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { status } = useNetworkStatus();
    const store = useLoginStore.getState();
    const [collapsed, setCollapsed] = useSafeState(false);
    const [expandedMenus, setExpandedMenus] = useSafeState<Set<string>>(
        new Set(),
    );
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

    const selectedKey = useMemo(() => {
        const path = location.pathname;
        for (const item of mainNavItems) {
            if (
                path === item.path ||
                (item.path !== '/' && path.startsWith(item.path))
            ) {
                return item.key;
            }
        }
        for (const item of collapsibleNavItems) {
            if (item.children) {
                for (const child of item.children) {
                    if (path.startsWith(child.path)) {
                        return item.key;
                    }
                }
            } else if (path.startsWith(item.path)) {
                return item.key;
            }
        }
        return '/';
    }, [location.pathname]);

    // Handle navigation
    const handleNavClick = (path: string) => {
        navigate(path);
    };

    const toggleMenu = (menuKey: string) => {
        setExpandedMenus((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(menuKey)) {
                newSet.delete(menuKey);
            } else {
                newSet.add(menuKey);
            }
            return newSet;
        });
    };

    const isMenuExpanded = (menuKey: string) => {
        return expandedMenus.has(menuKey);
    };

    const getThemeLabel = (mode: 'light' | 'dark' | 'system') => {
        const labels = {
            light: '浅色模式',
            dark: '深色模式',
            system: '跟随系统',
        };
        return themeMode === mode ? `${labels[mode]} ✓` : labels[mode];
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'theme',
            icon: isDark ? <MoonOutlined /> : <SunOutlined />,
            label: '主题设置',
            children: [
                {
                    key: 'theme-light',
                    icon: <SunOutlined />,
                    label: getThemeLabel('light'),
                    onClick: () => setThemeMode('light'),
                },
                {
                    key: 'theme-dark',
                    icon: <MoonOutlined />,
                    label: getThemeLabel('dark'),
                    onClick: () => setThemeMode('dark'),
                },
                {
                    key: 'theme-system',
                    icon: <ControlOutlined />,
                    label: getThemeLabel('system'),
                    onClick: () => setThemeMode('system'),
                },
            ],
        },
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
        <Layout
            className={`irify-layout ${isDark ? 'irify-dark' : 'irify-light'}`}
        >
            <Sider
                className="irify-layout-sider"
                theme={isDark ? 'dark' : 'light'}
                width={collapsed ? 72 : 200}
                collapsible
                collapsed={collapsed}
                trigger={null}
            >
                {/* Logo */}
                <div className="irify-logo" onClick={() => navigate('/')}>
                    <span className="logo-bracket">[</span>
                    <span className="logo-text">IR</span>
                    <span className="logo-bracket">]</span>
                    {!collapsed && <span className="logo-name">ify</span>}
                </div>

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

                    {collapsibleNavItems.map((item) => (
                        <React.Fragment key={item.key}>
                            <Tooltip
                                title={collapsed ? item.label : ''}
                                placement="right"
                            >
                                <div
                                    className={`irify-nav-item ${selectedKey === item.key ? 'active' : ''}`}
                                    onClick={() => {
                                        if (item.children) {
                                            toggleMenu(item.key);
                                        } else {
                                            handleNavClick(item.path);
                                        }
                                    }}
                                >
                                    <span className="nav-icon">
                                        {item.icon}
                                    </span>
                                    {!collapsed && (
                                        <span className="nav-label">
                                            {item.label}
                                        </span>
                                    )}
                                    {!collapsed && item.children && (
                                        <span className="nav-arrow">
                                            {isMenuExpanded(item.key) ? (
                                                <DownOutlined />
                                            ) : (
                                                <RightOutlined />
                                            )}
                                        </span>
                                    )}
                                </div>
                            </Tooltip>

                            {!collapsed &&
                                item.children &&
                                isMenuExpanded(item.key) && (
                                    <div className="irify-nav-submenu">
                                        {item.children.map((child) => (
                                            <Tooltip
                                                key={child.key}
                                                title={child.label}
                                                placement="right"
                                            >
                                                <div
                                                    className={`irify-nav-item ${selectedKey === item.key && location.pathname.startsWith(child.path) ? 'active-sub' : ''}`}
                                                    onClick={() =>
                                                        handleNavClick(
                                                            child.path,
                                                        )
                                                    }
                                                >
                                                    <span className="nav-icon" />
                                                    <span className="nav-label">
                                                        {child.label}
                                                    </span>
                                                </div>
                                            </Tooltip>
                                        ))}
                                    </div>
                                )}
                        </React.Fragment>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className="irify-sider-footer">
                    <div
                        className="irify-collapse-trigger"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? <SiderOpen /> : <SiderClose />}
                    </div>

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
