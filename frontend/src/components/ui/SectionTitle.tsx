interface SectionTitleProps {
    children: React.ReactNode;
    className?: string;
}
export function SectionTitle({ children, className = '' }: SectionTitleProps) {
    return (
        <h2 className={`mb-4 text-xl font-semibold text-gray-900 ${className}`}>
            {children}
        </h2>
    );
}