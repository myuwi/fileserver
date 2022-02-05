import * as React from 'react';
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { Icon, sizeClasses, positionClasses } from './Icon';

const variantClasses = {
    none: '',
    uniform: '',
    wide: '',
    'full-width': '',
};

const iconPositions = {
    center: ' flex items-center justify-center',
};

type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    icon: string;
    iconSize?: keyof typeof sizeClasses;
    iconAlign?: keyof typeof iconPositions;
    disabled?: boolean;
    size?: keyof typeof sizeClasses;
    variant?: keyof typeof variantClasses;
    position?: keyof typeof positionClasses;
};

export const IconButton = ({
    icon,
    iconSize = 'full',
    iconAlign = 'center',
    className = '',
    size = '24',
    variant = 'none',
    disabled = false,
    onClick,
    ...props
}: Props) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (disabled || !onClick) return;
        onClick(e);
    };

    return (
        <button
            className={`${sizeClasses[size]}${iconPositions[iconAlign]} flex-shrink-0 outline-none focus:outline-none${
                disabled ? ' opacity-30 cursor-default' : ''
            } ${className}`}
            onClick={handleClick}
            aria-disabled={disabled}
            {...props}
        >
            <Icon icon={icon} size={iconSize} />
        </button>
    );
};
