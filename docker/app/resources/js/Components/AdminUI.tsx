// ── Admin UI Components & Utilities ──────────────────────────────────────────
export const StatCard = ({
    label,
    title,
    value,
    icon,
    iconBg,
}: {
    label: string;
    title: string;
    value: string;
    icon: React.ReactNode;
    iconBg: string;
}) => (
    <div className="bg-card border border-border rounded-venus p-4 md:p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between">
            <span
                className={`w-10 h-10 rounded-venus flex items-center justify-center ${iconBg}`}
            >
                {icon}
            </span>
            <span className="text-[11px] md:text-label-sm text-foreground/40 font-semibold tracking-widest">
                {label}
            </span>
        </div>
        <div>
            <p className="text-xs md:text-body-reg text-foreground/60">
                {title}
            </p>
            <p className="text-xl md:text-h2 text-super-black font-bold mt-1">
                {value}
            </p>
        </div>
    </div>
);

export const PageHeader = ({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}) => (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex-1">
            <h1 className="text-2xl md:text-h2 text-super-black font-heading font-bold">
                {title}
            </h1>
            {subtitle && (
                <p className="text-sm md:text-body-m text-foreground/60 mt-1 md:mt-2">
                    {subtitle}
                </p>
            )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
    </div>
);

export const PrimaryButton = ({
    children,
    onClick,
    className = "",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-md text-label-sm font-bold ${className}`}
    >
        {children}
    </button>
);

export const SecondaryButton = ({
    children,
    onClick,
    className = "",
}: {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 border border-border bg-card text-foreground/70 px-4 md:px-5 py-2 md:py-2.5 rounded-full hover:bg-surface active:scale-95 transition-all text-sm md:text-label-sm font-semibold ${className}`}
    >
        {children}
    </button>
);

export const IconButton = ({
    icon,
    onClick,
    variant = "primary",
    className = "",
}: {
    icon: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "danger";
    className?: string;
}) => {
    const baseStyle =
        "w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-all";
    const variants = {
        primary: "bg-primary/10 text-primary hover:bg-primary/20",
        danger: "bg-red-100 text-red-500 hover:bg-red-200",
    };
    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {icon}
        </button>
    );
};

export const Badge = ({
    text,
    variant = "default",
    className = "",
}: {
    text: string;
    variant?: "default" | "warning" | "success" | "danger";
    className?: string;
}) => {
    const variants = {
        default: "bg-primary/15 text-secondary border border-primary/30",
        warning: "bg-orange-100 text-orange-600 border border-orange-200",
        success: "bg-emerald-100 text-emerald-700 border border-emerald-200",
        danger: "bg-red-100 text-red-600 border border-red-200",
    };
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] md:text-[11px] font-bold tracking-widest ${variants[variant]} ${className}`}
        >
            {text}
        </span>
    );
};

export const TableResponsive = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="px-4 md:px-0">{children}</div>
    </div>
);

export const EmptyState = ({
    icon,
    title,
    description,
    action,
}: {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) => (
    <div className="flex flex-col items-center justify-center gap-3 md:gap-4 py-12 md:py-16">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-surface flex items-center justify-center text-2xl md:text-3xl text-foreground/30">
            {icon}
        </div>
        <div className="text-center">
            <h3 className="text-lg md:text-h4 text-super-black font-bold">
                {title}
            </h3>
            {description && (
                <p className="text-xs md:text-body-reg text-foreground/60 mt-1">
                    {description}
                </p>
            )}
        </div>
        {action && <div className="mt-2 md:mt-4">{action}</div>}
    </div>
);

export const FilterTabs = ({
    tabs,
    active,
    onChange,
    className = "",
}: {
    tabs: string[];
    active: string;
    onChange: (tab: string) => void;
    className?: string;
}) => (
    <div
        className={`flex gap-1 bg-surface rounded-full p-1 overflow-x-auto ${className}`}
    >
        {tabs.map((tab) => (
            <button
                key={tab}
                onClick={() => onChange(tab)}
                className={`px-3 md:px-4 py-1.5 rounded-full text-xs md:text-label-sm font-semibold whitespace-nowrap transition-all ${active === tab ? "bg-secondary text-white shadow" : "text-foreground/60 hover:text-foreground"}`}
            >
                {tab}
            </button>
        ))}
    </div>
);

export const SearchInput = ({
    value,
    onChange,
    placeholder = "Cari...",
    className = "",
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}) => (
    <div className={`relative ${className}`}>
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30"
        >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-card border border-border rounded-venus pl-8 pr-4 py-2 text-xs md:text-body-reg text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
        />
    </div>
);

export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-card border border-border rounded-venus shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/30">
                    <h3 className="text-h4 text-super-black font-bold">{title}</h3>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border text-foreground/50 hover:text-foreground transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
                {footer && (
                    <div className="px-6 py-4 border-t border-border bg-surface/30 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
