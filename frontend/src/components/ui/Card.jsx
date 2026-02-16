import React from 'react';

const Card = ({
    children,
    variant = 'default',
    className = '',
    onClick,
    ...props
}) => {
    // Map variant to class name
    const getVariantClass = () => {
        switch (variant) {
            case 'problem':
                return 'card-problem';
            case 'content':
                // Reuse basic card styles or define specific content block styles if needed
                return 'content-block';
            case 'default':
            default:
                return 'card';
        }
    };

    return (
        <div
            className={`${getVariantClass()} ${className}`}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
