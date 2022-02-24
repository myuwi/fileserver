import { File, FileOrFolder } from '@backend-types';

export { FileOrFolder };

export type ViewerMedia = {
    data: File;
    type: 'image' | 'video' | 'audio' | undefined;
};
