import Knex from 'knex';
import * as path from 'path';
import { __rootdir__ } from '../root';

const config = {
    client: 'better-sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.join(__rootdir__, '..', 'db.sqlite'),
    },
    migrations: {
        tableName: 'migrations_history',
        directory: path.join(__rootdir__, '..', 'migrations'),
    },
};

export const knex = Knex(config);

export default config;
