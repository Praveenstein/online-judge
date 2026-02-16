import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    ...props
}) => {
    const variantClass = `button-${variant}`;
    const sizeClass = `button-${size}`;

    return (
        <button
            className={`${variantClass} ${sizeClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
