export type Dimensions = {
    width: number;
    height: number;
}

// TODO: Split into two types
export type File = {
    name: string;
    id: string;
    isDirectory: boolean;
    size: number;
    hasThumb?: boolean;
    metadata?: any;
    fileCount?: number;
}

export type VideoMetadata = {
    audioCodec: string | undefined;
    videoCodec: string | undefined;
    duration: number | undefined;
}

export type DbEntry = {
    id: string;
    parent?: string;
    url: string;
}