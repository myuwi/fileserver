import * as React from 'react';

type Props = {
    icon: string | React.ReactElement | SVGElement;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const Icon = React.memo(({ icon, className, onClick }: Props) => {
    const classes = !className ? 'icon' : `icon ${className}`;

    if (typeof icon === 'string') {
        return (
            <div className={classes} onClick={onClick}>
                <svg viewBox="0 0 24 24">
                    <path fill="currentColor" d={icon} />
                </svg>
            </div>
        );
    }

    return (
        <div className={classes} onClick={onClick}>
            {icon}
        </div>
    );
});

Icon.displayName = 'Icon';

export { Icon };
