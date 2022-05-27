import { knex } from './db';

export const createSchema = () =>
    knex.schema
        .createTable('files', (t: any) => {
            t.string('id', 8).notNullable().unique();
            t.string('parent', 8).references('files.id').onDelete('CASCADE');
            t.string('url').notNullable().unique();
            t.integer('updated');
        })
        .then(() => {
            console.log(' * Schema created.');
        })
        .catch((err: any) => {
            if (err.toString().toLowerCase().indexOf('table `files` already exists') === -1) {
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
