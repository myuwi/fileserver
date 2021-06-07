import Knex from 'knex';
import { DbEntry } from './types';
import { generateId } from './util';

const knex = Knex({
    client: 'sqlite3',
    connection: {
        filename: './db.sqlite'
    }
});

export const createSchema = () =>
    knex.schema
        .createTable('files', (t: any) => {
            t.string('id').notNullable().unique();
            t.string('url').notNullable().unique();
        })
        .then(() => {
            console.log(' * Schema created.');
        })
        .catch((err: any) => {
            if (err.toString().toLowerCase().indexOf('table `files` already exists') !== -1) {
                console.log(' * Schema already exists.');
            } else {
                throw new Error(` ! ERROR while creating schema: ${err}`);
            }
        });

export const dropSchema = () =>
    knex.schema
        .dropTableIfExists('files')
        .then(() => {
            console.log(' * Dropped tables.');
        })
        .catch((err: any) => {
            console.log(err);
        });




// TODO: Make everything link with IDs instead of paths
export const db = {
    getMultipleByUrl: async (pathArr: string[]): Promise<DbEntry[]> => {
        return await knex<DbEntry>('files')
            .select('*')
            .whereIn('url', pathArr);
    },
    getMultipleById: async (idArr: string[]): Promise<DbEntry[]> => {
        return await knex<DbEntry>('files')
            .select('*')
            .whereIn('id', idArr);
    },
    getById: async (id: string) => {
        return await knex<DbEntry>('files').where('id', id).first();
    },
    getByUrl: async (url: string) => {
        return await knex<DbEntry>('files').where('url', url).first();
    },
    insert: async (entry: DbEntry) => {
        try {
            const { id } = entry;
            const rows = await knex('files')
                .select()
                .where({ id });

            if (rows.length) {
                throw new Error('Insert failed - Duplicate ID found');
            }

            return await knex('files').insert(entry);
        } catch (err) {
            console.log(err);
        }
    },
    insertMany: async (data: DbEntry[]) => {
        try {
            let items = data;
            let i = 0;

            while (items.length) {
                const slice = items.slice(0, 100);

                await knex('files')
                    .insert(slice);

                i += slice.length;
                items = items.slice(slice.length);

                console.log(` * Inserted ${slice.length} items into the database`);
            }

        } catch (err) {
            console.log(err);
        }
    },
    generateUniqueId: async (length: number): Promise<string> => {
        const id = generateId(length);

        const rows = await knex('files')
            .where({ id });

        if (!rows.length) {
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

            alreadyExists =
                (await db.getMultipleById(ids))
                    .map(({ id }) => id);
        } while (alreadyExists.length);

        const newItems = items.map((u, i): DbEntry => ({
            id: ids[i],
            url: u
        }));

        return newItems;
    }
};