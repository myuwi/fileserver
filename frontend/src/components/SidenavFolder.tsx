import { useEffect, useState } from 'react';

import { Icon } from './Icon';
import { mdiMenuRight, mdiMenuDown, mdiFolder } from '@mdi/js';
import { collator } from '../Utils';
import { Spinner } from './Spinner';
import { TreeFolder } from '../types';

type Props = {
    breadcrumbs: any[];
    folder: TreeFolder;
    fetchData: (id?: string) => Promise<void>;
    folderDepth?: number;
    setDirectoryId: (id: string) => void;
};

export const SidenavFolder = ({ breadcrumbs, folder, fetchData, folderDepth = 0, setDirectoryId }: Props) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const isSelected = breadcrumbs?.[breadcrumbs.length - 1]?.id === folder.id;
    // if (current) console.log(folder.name)

    // Expand if this folder's child folder is selected
    useEffect(() => {
        if (!folder.children || !folder.children.length) return;
        const open = breadcrumbs?.[folderDepth]?.id === folder.id;
        if (open) setExpanded(true);
    }, [breadcrumbs]);

    const handleExpand = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();

        if (!folder.children) {
            fetchData(folder.id);
        }

        return setExpanded(!expanded);
    };

    const handleClick = () => {
        console.log(folder.children);
        if (folder.childCount) setExpanded(true);
        setDirectoryId(folder.id);
    };

    return (
        <>
            <div
                className={`${
                    isSelected ? 'bg-primary-500 text-white hover:bg-primary-600' : 'hover:bg-secondary-50'
                } select-none`}
                style={folderDepth ? { paddingLeft: folderDepth * 18 } : undefined}
            >
                <div
                    className="pr-3 pl-14 h-8 flex flex-row flex-nowrap items-center relative whitespace-nowrap overflow-hidden text-ellipsis"
                    onClick={handleClick}
                >
                    {!!folder.childCount && (
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
            {expanded &&
                (folder.children?.length ? (
                    <div className="fs-sidenav__folders__folder__children">
                        {!!folder.children?.length &&
                            folder.children
                                .sort((a: any, b: any) => collator.compare(a.name, b.name))
                                .map((childFolder: any, i: number) => {
                                    return (
                                        <SidenavFolder
                                            key={i}
                                            breadcrumbs={breadcrumbs}
                                            folder={childFolder}
                                            fetchData={fetchData}
                                            folderDepth={folderDepth + 1}
                                            setDirectoryId={setDirectoryId}
                                        />
                                    );
                                })}
                    </div>
                ) : (
                    <div className="flex items-center justify-center">
                        <Spinner size="16" />
                    </div>
                ))}
        </>
    );
};
