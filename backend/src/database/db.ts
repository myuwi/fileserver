import { generateId } from '../util';
import { BreadCrumb } from '../types';

import { PrismaClient } from '@prisma/client';
import type { File } from '.prisma/client';
const prisma = new PrismaClient();

// import { knex } from './knexfile';
// export { knex };

// TODO: Implement a database cleanup on start

export const db = {
    getMultipleByUrl: async (pathArr: string[]): Promise<File[]> => {
        // return await knex<DbEntry>('files').select('*').whereIn('url', pathArr);
        return await prisma.file.findMany({
            where: {
                path: {
                    in: pathArr,
                },
            },
        });
    },
    getMultipleById: async (idArr: string[]): Promise<File[]> => {
        return await prisma.file.findMany({
            where: {
                id: {
                    in: idArr,
                },
            },
        });
        // return await knex<DbEntry>('files').select('*').whereIn('id', idArr);
    },
    getChildren: async (id: string): Promise<File[]> => {
        return await prisma.file.findMany({
            where: {
                parentId: id,
            },
        });
        // return await knex<DbEntry>('files').select('*').where('parent', id);
    },
    getById: async (id: string) => {
        return await prisma.file.findUnique({
            where: {
                id,
            },
        });
        // return await knex<DbEntry>('files').where('id', id).first();
    },
    getByUrl: async (url: string) => {
        return await prisma.file.findUnique({
            where: {
                path: url,
            },
        });
        // return await knex<DbEntry>('files').where('url', url).first();
    },
    getBreadcrumbs: async (id: string) => {
        // FIXME: Yes, I know there's an SQL injection vulnerability here
        const breadcrumbs = await prisma.$queryRaw<BreadCrumb[]>`WITH parents (id, parentId, path, relative_depth) AS (
                SELECT id, parentId, path, 0
                FROM File
                WHERE id = ${id}
                UNION ALL
                SELECT f.id, f.parentId, f.path, c.relative_depth - 1
                FROM File f, parents c
                WHERE f.id = c.parentId
            )
            SELECT *
            FROM parents
            ORDER by relative_depth ASC`;

        console.log(breadcrumbs);
        return breadcrumbs;
    },
    insert: async (entry: File) => {
        try {
            return await prisma.file.create({
                data: entry,
            });
            // return await knex('files').insert(entry);
        } catch (err) {
            console.log(err);
        }
    },
    // FIXME: Dumb thing doesn't work well with Prisma
    insertMany: async (entries: File[]) => {
        const entryCount = entries.length;
        try {
            for (let i = 0; i < entries.length; i++) {
                const element = entries[i];
                await prisma.file.create({
                    data: element,
                });
            }
            console.log(` * Inserted ${entryCount} items into the database`);
        } catch (err) {
            console.log(err);
        }
    },
    setUpdateTimestamp: async (id: string, timestamp: number) => {
        try {
            await prisma.file.update({
                where: { id },
                data: { updated: timestamp },
            });
            // await knex<DbEntry>('files').where({ id }).update({ updated: timestamp });

            return true;
        } catch (err) {
            console.log(err);
        }
        return false;
    },
    deleteManyById: async (idArr: string[]) => {
        await prisma.file.deleteMany({
            where: {
                id: {
                    in: idArr,
                },
            },
        });
        // await knex<DbEntry>('files').whereIn('id', idArr).del();
        console.log(` * Removed ${idArr.length} items and their children from the database`);
    },
    generateUniqueId: async (length: number): Promise<string> => {
        const id = generateId(length);

        const rows = await prisma.file.count({
            where: {
                id,
            },
        });
        // const rows = await knex('files').where({ id });

        if (rows == 0) {
            return id;
        }

        return db.generateUniqueId(length);
    },
    // Very scuffed, might fix later
    generateIds: async (items: string[], idLength: number) => {
        const ids = Array(items.length)
            .fill(0)
            .map(() => generateId(idLength));

        let alreadyExists: string[] = [];

        do {
            if (alreadyExists.length) {
                for (let i = 0; i < ids.length; i++) {
                    const id = ids[i];
                    if (alreadyExists?.includes(id)) {
                        ids[i] = generateId(idLength);
                    }
                }
            }

            alreadyExists = (await db.getMultipleById(ids)).map(({ id }) => id);
        } while (alreadyExists.length);

        const newItems = items.map(
            (u, i): File => ({
                id: ids[i],
                path: u,
                parentId: null,
                updated: 0,
            })
        );

        return newItems;
    },
};
