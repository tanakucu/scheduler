import React from 'react';

const Button: React.FC<{ onClick: () => void; color?: string; children?: React.ReactNode }> = ({ onClick, children, color = '#007bff' }) => {
    const buttonStyle: React.CSSProperties = {
        backgroundColor: color,
        color: 'white',
        border: 'none',
        padding: '0.75rem 1.5rem',
        borderRadius: '5px',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        marginBottom: '1.5rem',
    };

    const hoverStyle: React.CSSProperties = {
        backgroundColor: darkenColor(color, 20),
    };

    const [isHovered, setIsHovered] = React.useState(false);

    return (
        <button
            style={isHovered ? { ...buttonStyle, ...hoverStyle } : buttonStyle}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
        </button>
    );
};

const darkenColor = (color: string, amount: number): string => {
    const colorValue = parseInt(color.slice(1), 16);
    const r = Math.max((colorValue >> 16) - amount, 0);
    const g = Math.max(((colorValue >> 8) & 0x00ff) - amount, 0);
    const b = Math.max((colorValue & 0x0000ff) - amount, 0);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

export default Button;