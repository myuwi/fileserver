import Knex from 'knex';

const knex = Knex({
    client: 'sqlite3',
    connection: {
        filename: './db.sqlite'
    }
});

export const createSchema = () =>
    knex.schema
        .createTable('files', (table: any) => {
            table.string('id').notNullable();
            table.string('url').notNullable();
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

export const db = {
    set: async (id: string, url: string) => {
        await knex('files')
            .select()
            .where({ id })
            .then(async (rows: any) => {
                if (rows.length === 0) {
                    // no matching records found
                    await knex('files').insert({ id, url });
                } else {
                    // return or throw - duplicate name found
                }
            })
            .catch((err: any) => {
                console.log(err);
                // you can find errors here.
            });
    },
    getById: async (id: string) => {
        return await knex('files').where('id', id).first();
    },
    getByUrl: async (url: string) => {
        return await knex('files').where('url', url).first();
    }
};