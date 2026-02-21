import React from 'react';

interface IconProps extends React.HTMLAttributes<HTMLElement> {
    name: string;
    type?: 'regular' | 'solid' | 'logo';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;
    color?: string;
    animation?: 'spin' | 'tada' | 'flashing' | 'burst' | 'fade-left' | 'fade-right' | 'fade-up' | 'fade-down';
    rotate?: '90' | '180' | '270';
    flip?: 'horizontal' | 'vertical';
}

const Icon: React.FC<IconProps> = ({
    name,
    type = 'regular',
    size = 'md',
    color,
    animation,
    rotate,
    flip,
    className = '',
    ...props
}) => {
    const typeClass = type === 'regular' ? 'bx' : type === 'solid' ? 'bxs' : 'bxl';
    const iconClass = `bx-${name}`;
    const sizeClass = ['xs', 'sm', 'md', 'lg', 'xl'].includes(size) ? `bx-${size}` : '';
    const animationClass = animation ? `bx-${animation}` : '';
    const rotateClass = rotate ? `bx-rotate-${rotate}` : '';
    const flipClass = flip ? `bx-flip-${flip}` : '';

    const combinedClasses = `${typeClass} ${iconClass} ${sizeClass} ${animationClass} ${rotateClass} ${flipClass} ${className}`.trim();

    const styles: React.CSSProperties = {
        ...props.style,
        color: color || undefined,
        fontSize: !['xs', 'sm', 'md', 'lg', 'xl'].includes(size) ? size : undefined,
    };

    return <i className={combinedClasses} style={styles} {...props}></i>;
};

export default Icon;
