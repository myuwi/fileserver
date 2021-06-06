export type Dimensions = {
    width: number | undefined
    height: number | undefined
}

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