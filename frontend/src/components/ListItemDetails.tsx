import * as React from 'react';
import { useState } from 'react';
import { Icon } from './Icon';
import { mdiFolder, mdiLinkVariant, mdiPlay, mdiFolderOpenOutline, mdiDownload } from '@mdi/js';

import { FileOrFolder } from '../types';
import { copyToClipboard, getTypeOf } from '../Utils';
import { ContextMenu } from './ContextMenu';
import { ViewMode } from '../hooks/useSettings';
import { useListItem } from '../hooks/useListItem';

type Props = React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
> & {
    item: FileOrFolder;
    selected: boolean;
    columnWidths: { [s: string]: number | string | undefined };
    onClick?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onDoubleClick?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onLongPress?: (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
    onEnter?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    onSpace?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    primaryAction: (item: FileOrFolder) => void;
    setSelected: (item: FileOrFolder, addToSelection: boolean) => void;
};

export const ListItemDetails = React.forwardRef(({
    className,
    item,
    selected,
    columnWidths,
    onClick,
    onDoubleClick,
    onLongPress,
    onEnter,
    onSpace,
    onFocus,
    primaryAction,
    setSelected,
    ...rest
}: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
    const {
        eventHandlers,
        fileTypeIcon,
        humanFileSize,
        extension,
        contextMenu
    } = useListItem<HTMLDivElement>({
        item,
        selected,
        onClick,
        onDoubleClick,
        onLongPress,
        onEnter,
        onSpace
    });

    const columns = [
        {
            id: 'NAME',
            content: item.name
        },
        {
            id: 'TYPE',
            content: item.type === 'FOLDER' ? 'Folder' : `${extension?.toUpperCase()} File`
        },
        {
            id: 'SIZE',
            content: item.type === 'FOLDER' ? `${item.fileCount} ${item.fileCount === 1 ? 'file' : 'files'}` : humanFileSize
        }
    ];

    return (
        <>
            <div
                className={`outline-none p-2 transition-colors duration-50 ease-in-out ${selected ? 'bg-primary-500 bg-opacity-20' : 'hover:bg-secondary-500 hover:bg-opacity-5'} select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-100 flex flex-row flex-1`}
                ref={ref}
                tabIndex={0}
                {...eventHandlers}
                {...rest}
                aria-selected={selected}
            >
                <div className="pl-2 pr-4 text-primary-500">
                    {item.type === 'FILE' && item.hasThumb ?
                        (
                            <img
                                className="h-4.5 w-4.5 object-cover object-center rounded-sm pointer-events-none"
                                src={`http://192.168.1.106:3000/api/thumb/${item.id}.jpg`}
                                alt="thumbnail"
                            />
                        ) : (
                            <Icon
                                icon={item.type === 'FOLDER' ? mdiFolder : fileTypeIcon}
                                size='18'
                            />
                        )
                    }
                </div>
                {columns.map((e, i) => {
                    return (
                        <div
                            key={e.id}
                            className="overflow-hidden overflow-ellipsis break-words whitespace-nowrap"
                            style={i === 0 ? { flex: '1 1 0%' } : { width: columnWidths[e.id] }}
                        >{e.content}</div>
                    );
                })}
            </div>

            {contextMenu.open && (
                <ContextMenu
                    position={contextMenu.pos}
                    onHide={() => contextMenu.setOpen(false)}
                >
                    {item.type === 'FOLDER' ? (
                        <ContextMenu.Item
                            icon={mdiFolderOpenOutline}
                            text="Open"
                            onClick={() => primaryAction(item)}
                        />
                    ) : (
                        <>
                            <ContextMenu.Item
                                icon={mdiPlay}
                                text="Play"
                                onClick={() => primaryAction(item)}
                            />
                            <ContextMenu.Item
                                icon={mdiDownload}
                                text="Download"
                                onClick={() => window.open('http://192.168.1.106:3000/api/file/' + item.id + '/download')}
                            />
                        </>
                    )}
                    <ContextMenu.Item
                        icon={mdiLinkVariant}
                        text="Copy Link"
                        onClick={() => copyToClipboard('http://192.168.1.106:3000/api/file/' + item.id)}
                    />
                </ContextMenu>
            )}
        </>
    );
});

ListItemDetails.displayName = 'ListItemDetails';
