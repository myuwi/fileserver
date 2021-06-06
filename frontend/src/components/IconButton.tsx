import * as React from 'react';

import { Icon } from './Icon';

type Props = {
    className?: string;
    disabled?: boolean;
    icon: string;
    onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const IconButton = ({ className, disabled = false, icon, onClick }: Props) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (disabled || !onClick) return;
        onClick(e);
    };

    const classes = !className ? 'icon-button' : `icon-button ${className}`;

    return (
        <button className={classes} onClick={handleClick} aria-disabled={disabled}>
            <Icon icon={icon} />
        </button>
    );
};

export { IconButton };
