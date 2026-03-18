import './IRifyLogo.scss';

const GridIcon = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="irify-grid-icon"
    >
        <rect x="2" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="16" y="2" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="2" y="9" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="16" y="9" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="2" y="16" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="9" y="16" width="6" height="6" rx="1" fill="currentColor" />
        <rect x="16" y="16" width="6" height="6" rx="1" fill="currentColor" />
    </svg>
);

const IRifyLogo = () => {
    return (
        <div className="irify-logo-wrapper">
            <div className="irify-logo-container">
                <GridIcon />
                <span className="irify-logo-text">IRify</span>
            </div>
            <div className="irify-tagline">
                编译器级静态分析 · SSA驱动 · 多语言支持
            </div>
        </div>
    );
};

export default IRifyLogo;
