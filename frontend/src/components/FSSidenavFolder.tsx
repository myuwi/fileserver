import { useEffect, useState } from 'react';

import { Icon } from './Icon';
import { mdiMenuRight, mdiMenuDown, mdiFolder } from '@mdi/js';

type Props = {
    breadcrumbs?: any;
    folder: any;
    folderDepth?: number;
    setDirectoryId: (id: string) => void;
}

const FSSidenavFolder = ({ breadcrumbs, folder, folderDepth = 0, setDirectoryId }: Props) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const current = breadcrumbs && breadcrumbs.length > 0 && breadcrumbs[folderDepth] && breadcrumbs[breadcrumbs.length - 1].id === folder.id;
    // if (current) console.log(folder.name)

    useEffect(() => {
        if (folder.folders.length <= 0) return;
        const open = breadcrumbs && breadcrumbs.length > 0 && breadcrumbs[folderDepth] && breadcrumbs[folderDepth].id === folder.id;
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

    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

    const classes = current ? 'fs-sidenav__folders__folder current' : 'fs-sidenav__folders__folder';

    return (
        <>
            <div className={classes} style={folderDepth ? { paddingLeft: folderDepth * 18 } : undefined}>
                <div className="fs-sidenav__folders__folder__inner" onClick={handleClick}>
                    {folder.folders.length > 0 && (
                        <Icon className="expand" icon={expanded ? mdiMenuDown : mdiMenuRight} onClick={handleExpand} />
                    )}

                    <Icon className="folder" icon={mdiFolder} />

                    <span>{folder.name}</span>
                </div>
            </div>
            {expanded && (
                <div className="fs-sidenav__folders__folder__children">
                    {folder.folders.sort((a: any, b: any) => collator.compare(a.name, b.name)).map((childFolder: any, i: number) => {
                        return (
                            <FSSidenavFolder
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

export { FSSidenavFolder };
