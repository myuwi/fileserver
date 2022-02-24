import { ReactNode, useEffect, useRef } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';

type ContextMenuProps = {
    children: ReactNode;
    className?: string;
    position: { x: number; y: number };
    onHide: () => void;
};

export const ContextMenu = ({ children, className = '', position, onHide }: ContextMenuProps) => {
    const ref = useRef<HTMLDivElement>(null);

    const closeMenu = (e: MouseEvent) => {
        if (ref.current && ref.current.contains(e.target as Node)) return;
        onHide();
    };

    useEffect(() => {
        document.addEventListener('click', closeMenu);
        document.addEventListener('contextmenu', closeMenu);

        return () => {
            document.removeEventListener('click', closeMenu);
            document.removeEventListener('contextmenu', closeMenu);
        };
    }, []);

    return createPortal(
        <div
            ref={ref}
            className="flex flex-col flex-nowrap fixed z-50 py-2 bg-white border border-secondary-100 rounded shadow cursor-default min-w-52"
            style={{ top: position.y, left: position.x }}
        >
            {children}
        </div>,
        document.getElementById('popup-container')!
    );
};

type ContextMenuItemProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    text: string;
    icon?: string;
};

// TODO: Fix this stupid props validation error
const ContextMenuItem = ({ icon, text, onClick, ...rest }: ContextMenuItemProps) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick && onClick(e);
    };

    return (
        <button
            onClick={handleClick}
            className="flex flex-row flex-nowrap flex-1 items-center transition-colors duration-50 ease-in-out bg-white hover:bg-secondary-500 hover:bg-opacity-5 text-secondary-700 hover:text-secondary-800 px-4 py-1.5 outline-none focus:outline-none mb-1 last:mb-0"
            {...rest}
        >
            {!!icon && <Icon icon={icon} size="20" className="mr-2" />}
            <span>{text}</span>
        </button>
    );
};

ContextMenu.Item = ContextMenuItem;
