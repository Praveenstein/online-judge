import React from 'react';

const Input = ({
    label,
    error,
    helperText,
    className = '',
    id,
    ...props
}) => {
    return (
        <div className={`input-container ${className}`}>
            {label && (
                <label htmlFor={id} className="input-label">
                    {label}
                </label>
            )}
            <input
                id={id}
                className={`input-text ${error ? 'border-[var(--color-error)]' : ''}`}
                {...props}
            />
            {error && <p className="input-error">{error}</p>}
            {!error && helperText && <p className="input-helper">{helperText}</p>}
        </div>
    );
};

export default Input;
