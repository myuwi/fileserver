import * as express from 'express';
const router = express.Router();

import { __rootdir__ } from '../root';
import { fs } from '../controllers';
import { logRequest } from '../middleware';
import { THUMB_DIR } from '../thumbs';

router.use('/thumb', express.static(THUMB_DIR));

router.get('/dir/:id?', logRequest, fs.directory);

// router.get('/fs/folders', logRequest, fs.folders);

router.get('/file/:id', logRequest, fs.file);

router.get('/file/:id/download', logRequest, fs.download);

export { router };