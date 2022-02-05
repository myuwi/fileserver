import { knex } from './db';

export const createSchema = () =>
    knex.schema
        .createTable('files', (t: any) => {
            t.string('id', 8).notNullable().unique();
            t.string('parent', 8);
            t.string('url').notNullable().unique();

            t.foreign('parent').references('id').inTable('files');
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
