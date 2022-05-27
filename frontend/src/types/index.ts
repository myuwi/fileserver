import { FsFile, TreeFolder, FileOrFolder } from '@backend-types';
type File = FsFile;
export { File, TreeFolder, FileOrFolder };

export type ViewerMedia = {
    data: File;
    type: 'image' | 'video' | 'audio' | undefined;
};
