import { Pool } from 'pg';

import { UsersTable } from './UsersTable';
import { RolesTable } from './RolesTable';
import { NotionIntegrationTable } from './NotionIntegrationTable';
import { TelegramIntegrationTable } from './TelegramIntegrationTable';

export class Db {
    readonly users: UsersTable;
    readonly roles: RolesTable;
    readonly notionIntegration: NotionIntegrationTable;
    readonly telegramIntegration: TelegramIntegrationTable;

    constructor(pool: Pool) {
        this.users = new UsersTable(pool);
        this.roles = new RolesTable(pool);
        this.notionIntegration = new NotionIntegrationTable(pool);
        this.telegramIntegration = new TelegramIntegrationTable(pool);
    }
}