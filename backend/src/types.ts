export type Dimensions = {
    width: number;
    height: number;
};

type BaseFsElement = {
    name: string;
    id: string;
    directory: boolean;
};

export type FsFile = BaseFsElement & {
    directory: false;
    size: number;
    hasThumb?: boolean;
    // metadata?: any;
    contentType: 'audio' | 'video' | 'image' | undefined;
};

export type FsFolder = BaseFsElement & {
    directory: true;
    fileCount: {
        file: number;
        folder: number;
        total: number;
    };
};

export type FileOrFolder = FsFile | FsFolder;

export type VideoMetadata = {
    audioCodec: string | undefined;
    videoCodec: string | undefined;
    duration: number | undefined;
};

export type DbEntry = {
    id: string;
    parent?: string;
    url: string;
    updated?: number;
};

export type TreeFolder = {
    name: string;
    id: string;
    childCount: number;
    children?: TreeFolder[];
};

export type BreadCrumb = {
    id: string;
    parentId: string | null;
    path: string;
    relative_depth: number;
};
