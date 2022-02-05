import * as express from 'express';
const router = express.Router();

import { __rootdir__ } from '../root';
import * as controller from '../controllers';
import { logRequest } from '../middleware/logRequest';
import { THUMB_DIR } from '../thumbs';

router.use('/thumb', express.static(THUMB_DIR));

router.get('/dir/:id?', logRequest, controller.directory);

router.get('/folders', logRequest, controller.folders);

router.get('/file/:id', logRequest, controller.file);

router.get('/file/:id/download', logRequest, controller.download);

export { router };
