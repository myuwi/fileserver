export type Dimensions = {
    width: number;
    height: number;
};

export type File = {
    name: string;
    id: string;
    directory: false;
    size: number;
    hasThumb?: boolean;
    metadata?: any;
    contentType: 'audio' | 'video' | 'image' | undefined;
};

export type Folder = {
    name: string;
    id: string;
    directory: true;
    fileCount: {
        file: number;
        folder: number;
        total: number;
    };
};

export type FileOrFolder = File | Folder;

export type VideoMetadata = {
    audioCodec: string | undefined;
    videoCodec: string | undefined;
    duration: number | undefined;
};

export type DbEntry = {
    id: string;
    parent?: string;
    url: string;
};

export type TreeFolder = {
    name: string;
    id: string;
    childCount: number;
    children?: TreeFolder[];
};

export type BreadCrumb = {
    id: string;
    parent: string | null;
    url: string;
    relative_depth: number;
};
