import { PgTable } from './Table';
import { Pool } from 'pg';

export class RolesTable extends PgTable {
    constructor(pool: Pool) {
        super(pool, {
            tableName: 'roles',
            primaryKey: 'role_id'
        });
    }

    async getName(id: string) {
        const role = await this.get(id);
        return role?.role_name;
    }
}