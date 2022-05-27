import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.table('files', (t) => {
        t.integer('updated');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.table('files', (t) => {
        t.dropColumn('updated');
    });
}
