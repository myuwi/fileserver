import { useEffect, useRef, useState } from 'react';

import { Icon } from './Icon';
import { mdiSortVariant } from '@mdi/js';
import { FSSidenavFolder } from './FSSidenavFolder';

import { useDrag } from '../hooks/useDrag';

type Props = {
    breadcrumbs: any;
    folders: any;
    setDirectoryId: (id: string) => void;
}

// TODO: Improve look
const FSSidenav = ({ breadcrumbs, folders, setDirectoryId }: Props) => {
    const dragRef = useRef<HTMLDivElement>(null);

    const { coords, dragging } = useDrag(dragRef);

    const [paneWidth, setPaneWidth] = useState<number>(260);

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
        <div className="fs-sidenav" style={{ width: paneWidth }}>
            {/* <div className="fs-title">File Server</div> */}
            <div className="fs-directories">
                <div className="fs-directories__title">
                    <span>Folders</span>
                    <Icon icon={mdiSortVariant} />
                </div>
                <div className="fs-sidenav__folders">
                    {folders && folders.map((folder: any, i: number) => {
                        // Breadcrumbs + openByDefault prop
                        return (
                            <FSSidenavFolder key={i} breadcrumbs={breadcrumbs} folder={folder} setDirectoryId={setDirectoryId} />
                        );
                    })}
                </div>
            </div>
            <div ref={dragRef} className="fs-sidenav__drag-region"></div>
        </div >
    );
};

export { FSSidenav };
