import { useEffect, useRef, useState } from 'react';

import { Icon } from './Icon';
import { mdiSortVariant } from '@mdi/js';
import { SidenavFolder } from './SidenavFolder';

import { useDrag } from '../hooks/useDrag';

type Props = {
    breadcrumbs: any;
    folders: any;
    setDirectoryId: (id: string) => void;
};

// TODO: Improve look
export const Sidenav = ({ breadcrumbs, folders, setDirectoryId }: Props) => {
    const dragRef = useRef<HTMLDivElement>(null);

    const { coords, dragging } = useDrag(dragRef);

    const [paneWidth, setPaneWidth] = useState<number>(256);

    useEffect(() => {
        document.documentElement.classList.toggle('resize-x', dragging);
    }, [dragging]);

    useEffect(() => {
        if (!coords || !coords.x) return;

        const width = Math.max(Math.min(coords ? coords.x + 2 : 256, 400), 200);
        setPaneWidth(width);

        // const rounded = Math.round(width / 10) * 10

        // setPaneWidth(rounded)
    }, [coords]);

    return (
        <div
            className="flex flex-col flex-nowrap flex-none relative overflow-hidden w-64 bg-white border-r border-solid border-secondary-100"
            style={{ width: paneWidth }}
        >
            {/* <div className="fs-title">File Server</div> */}
            <div className="flex flex-col flex-nowrap flex-auto overflow-hidden">
                <div className="flex w-full h-9 items-center px-3 flex-shrink-0 relative">
                    <span>Folders</span>
                    <Icon icon={mdiSortVariant} className="ml-auto" size="18" />
                </div>
                <div className="flex flex-col flex-nowrap flex-auto overflow-auto">
                    {folders &&
                        folders.map((folder: any, i: number) => {
                            // Breadcrumbs + openByDefault prop
                            return (
                                <SidenavFolder
                                    key={i}
                                    breadcrumbs={breadcrumbs}
                                    folder={folder}
                                    setDirectoryId={setDirectoryId}
                                />
                            );
                        })}
                </div>
            </div>
            <div ref={dragRef} className="absolute inset-y-0 right-0 bg-transparent w-1 cursor-ew-resize"></div>
        </div>
    );
};
