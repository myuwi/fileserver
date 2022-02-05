import * as React from 'react';

export const sizeClasses = {
    'full': 'h-full w-full',
    '2/3': 'h-2/3 w-2/3',
    '64': 'h-16 w-16',
    '48': 'h-12 w-12',
    '32': 'h-8 w-8',
    '28': 'h-7 w-7',
    '24': 'h-6 w-6',
    '20': 'h-5 w-5',
    '18': 'h-4.5 w-4.5',
    '16': 'h-4 w-4'
};

export const positionClasses = {
    default: '',
    center: ' absolute top-1/2 left-1/2 transform translate -translate-x-1/2 -translate-y-1/2'
};

type Props = {
    icon: string | React.ReactElement | SVGElement;
    className?: string;
    size?: keyof typeof sizeClasses;
    position?: keyof typeof positionClasses;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
};

export const Icon = React.memo(({
    icon,
    className = '',
    size = '24',
    position = 'default',
    onClick
}: Props) => {
    const classes = `${sizeClasses[size]}${positionClasses[position]} flex-shrink-0 ${className}`;

    return (
        typeof icon === 'string' ? (
            <div className={classes} onClick={onClick}>
                <svg
                    className="h-full w-full"
                    viewBox="0 0 24 24"
                >
                    <path fill="currentColor" d={icon} />
                </svg>
            </div>
        ) : (
            <div className={classes} onClick={onClick}>
                {icon}
            </div >
        )
    );
});

Icon.displayName = 'Icon';
