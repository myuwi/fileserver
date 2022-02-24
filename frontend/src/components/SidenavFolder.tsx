import { useEffect, useState } from 'react';

import { Icon } from './Icon';
import { mdiMenuRight, mdiMenuDown, mdiFolder } from '@mdi/js';
import { collator } from '../Utils';

type Props = {
    breadcrumbs: any[];
    folder: any;
    folderDepth?: number;
    setDirectoryId: (id: string) => void;
};

type Folder = {
    name: string;
    id: string;
    folders: Folder[];
};

export const SidenavFolder = ({ breadcrumbs, folder, folderDepth = 0, setDirectoryId }: Props) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const current =
        breadcrumbs.length > 0 && breadcrumbs[folderDepth] && breadcrumbs[breadcrumbs.length - 1].id === folder.id;
    // if (current) console.log(folder.name)

    useEffect(() => {
        if (folder.folders.length <= 0) return;
        const open = breadcrumbs.length > 0 && breadcrumbs[folderDepth] && breadcrumbs[folderDepth].id === folder.id;
        if (open) setExpanded(true);
    }, [breadcrumbs]);

    const handleExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();

        return setExpanded(!expanded);
    };

    const handleClick = () => {
        console.log(folder.folders);
        if (folder.folders.length > 0) setExpanded(true);
        setDirectoryId(folder.id);
    };

    return (
        <>
            <div
                className={`${current ? 'bg-primary-500 text-white hover:bg-primary-600' : 'hover:bg-secondary-50'}`}
                style={folderDepth ? { paddingLeft: folderDepth * 18 } : undefined}
            >
                <div
                    className="pr-3 pl-14 h-8 flex flex-row flex-nowrap items-center relative whitespace-nowrap overflow-hidden text-ellipsis"
                    onClick={handleClick}
                >
                    {folder.folders.length > 0 && (
                        <Icon
                            size="18"
                            className="absolute top-1/2 -translate-y-1/2 left-2"
                            icon={expanded ? mdiMenuDown : mdiMenuRight}
                            onClick={handleExpand}
                        />
                    )}

                    <Icon className="absolute top-1/2 -translate-y-1/2 left-8" icon={mdiFolder} size="18" />

                    <span className="text-ellipsis overflow-hidden">{folder.name}</span>
                </div>
            </div>
            {expanded && (
                <div className="fs-sidenav__folders__folder__children">
                    {folder.folders
                        .sort((a: any, b: any) => collator.compare(a.name, b.name))
                        .map((childFolder: any, i: number) => {
                            return (
                                <SidenavFolder
                                    key={i}
                                    breadcrumbs={breadcrumbs}
                                    folder={childFolder}
                                    folderDepth={folderDepth + 1}
                                    setDirectoryId={setDirectoryId}
                                />
                            );
                        })}
                </div>
            )}
        </>
    );
};
