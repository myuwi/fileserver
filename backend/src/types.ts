export type Dimensions = {
    width: number;
    height: number;
};

export type File = {
    name: string;
    id: string;
    type: 'FILE';
    size: number;
    hasThumb?: boolean;
    metadata?: any;
    contentType: 'audio' | 'video' | 'image' | undefined;
};

export type Folder = {
    name: string;
    id: string;
    type: 'FOLDER';
    fileCount: number;
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
