import { File, FileOrFolder } from '@backend-types';

// export type ItemData = {
//     name: string;
//     id: string;
//     isDirectory: boolean;
//     size: number;
//     type: 'audio' | 'video' | 'image' | undefined;
//     hasThumb?: boolean;
//     metadata?: any;
//     fileCount?: number;
// };

export { FileOrFolder };

export type ViewerMedia = {
    data: File;
    type: 'image' | 'video' | 'audio' | undefined;
};
