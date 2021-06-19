import * as React from 'react';
import { ButtonHTMLAttributes, DetailedHTMLProps } from 'react';

import { Icon } from './Icon';

type Props = DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    disabled?: boolean;
    icon: string;
}


const IconButton = ({ className, disabled = false, icon, onClick, ...props }: Props) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (disabled || !onClick) return;
        onClick(e);
    };

    const classes = !className ? 'icon-button' : `icon-button ${className}`;

    return (
        <button
            className={classes}
            onClick={handleClick}
            aria-disabled={disabled}
            {...props}
        >
            <Icon icon={icon} />
        </button>
    );
};

export { IconButton };
