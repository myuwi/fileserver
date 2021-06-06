export type FsFile = {
    name: string;
    id: string;
    isDirectory: boolean;
    size: number;
    hasThumb?: boolean;
    metadata?: any;
    fileCount?: number;
}


export type ViewerMedia = {
    name: string,
    id: string,
    type: 'image' | 'video' | 'audio' | undefined
}