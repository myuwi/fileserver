import { Request, Response } from 'express';

import { getFileParents } from '../functions';

export const tree = async (req: Request, res: Response) => {
    const id = req.params.id;

    const files = await getFileParents(typeof id === 'string' ? id : undefined);

    return res.status(200).json(files);
};
