import { PgTable } from './Table';
import { Pool } from 'pg';

export class TelegramIntegrationTable extends PgTable {
    constructor(pool: Pool) {
        super(pool, {
            tableName: 'telegram_integration',
            primaryKey: 'user_id'
        });
    }
}