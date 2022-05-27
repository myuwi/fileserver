import { useEffect, useRef, useState } from 'react';

import { Icon } from './Icon';
import { mdiSortVariant } from '@mdi/js';
import { SidenavFolder } from './SidenavFolder';
import * as isDeepEqual from 'fast-deep-equal';

import { useDrag } from '../hooks/useDrag';
import { TreeFolder } from '../types';
import axios from 'axios';
import { LOGGER } from '../LOGGER';

type Props = {
    breadcrumbs: any[] | undefined;
    setDirectoryId: (id: string) => void;
};

const merge = (rootOld: TreeFolder[], rootNew: TreeFolder[]) => {
    let foundChange = false;

    const mergeFolder = (folderOld: TreeFolder, folderNew?: TreeFolder): TreeFolder => {
        if (!folderNew) return folderOld;
        if (!folderNew.children) return folderOld;

        if (!folderOld.children) {
            foundChange = true;
            return folderNew;
        }

        return {
            ...folderNew,
            children: mergeChildren(folderOld.children, folderNew.children),
        };
    };

    const mergeChildren = (childrenOld: TreeFolder[], childrenNew: TreeFolder[]) => {
        return childrenOld.map((f: TreeFolder, i) => {
            if (foundChange) return f;

            return mergeFolder(
                f,
                childrenNew.find((e) => e.id === f.id)
            );
        });
    };

    const merged = mergeChildren(rootOld, rootNew);

    return merged;
};

export const Sidenav = ({ breadcrumbs, setDirectoryId }: Props) => {
    const dragRef = useRef<HTMLDivElement>(null);

    const [folders, setFolders] = useState<TreeFolder[]>([]);

    const patchFolderStructure = (folders: TreeFolder[]) => {
        setFolders((old) => {
            if (!old.length) return folders;

            return merge(old, folders);
        });
    };

    const bcRef = useRef(breadcrumbs);

    if (!isDeepEqual(breadcrumbs, bcRef)) {
        bcRef.current = breadcrumbs;
    }

    const fetchData = async (id?: string) => {
        let url = '/api/tree';

        if (id) url += `/${id}`;

        // console.log(url)
        try {
            const resData: TreeFolder[] = await axios.get(url).then((res) => res.data);

            LOGGER.debug('Tree', resData);

            patchFolderStructure(resData);
        } catch (err: any) {
            console.log(err);
        }
    };

    useEffect(() => {
        if (!breadcrumbs) return;

        console.log(breadcrumbs);

        const id = breadcrumbs?.length ? breadcrumbs[breadcrumbs.length - 1].id : undefined;

        fetchData(id);
    }, [bcRef.current]);

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
                    {/* <div className="select-none text-secondary-600 flex flex-1 flex-row justify-center py-4">
                        Currently borked
                    </div> */}
                    {breadcrumbs && folders?.length ? (
                        folders.map((folder, i: number) => {
                            // Breadcrumbs + openByDefault prop
                            return (
                                <SidenavFolder
                                    key={i}
                                    breadcrumbs={breadcrumbs}
                                    folder={folder}
                                    fetchData={fetchData}
                                    setDirectoryId={setDirectoryId}
                                />
                            );
                        })
                    ) : (
                        <div className="select-none text-secondary-600 flex flex-1 flex-row justify-center py-4">
                            No folders found...
                        </div>
                    )}
                </div>
            </div>
            <div ref={dragRef} className="absolute inset-y-0 right-0 bg-transparent w-1 cursor-ew-resize"></div>
        </div>
    );
};
