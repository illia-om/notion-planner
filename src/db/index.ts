import { Pool, QueryResult } from 'pg';
import type { INotionIntegration } from './../types';

export class Db {
    private readonly pool: Pool;
    private readonly usersCollectionName: string;
    private readonly rolesCollectionName: string;
    private readonly notionIntegrationCollectionName: string;
    private readonly telegramIntegrationCollectionName: string;

    constructor(databaseUrl: string) {
        this.pool = new Pool({
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false }
        });
        this.usersCollectionName = 'users';
        this.rolesCollectionName = 'roles';
        this.notionIntegrationCollectionName = 'notion_integration';
        this.telegramIntegrationCollectionName = 'telegram_integration';
    }

    query(text: string, params: any[]): Promise<QueryResult> {
        return this.pool.query(text, params)
    }

    get(collectionName: string, value: any): Promise<QueryResult> {
        return this.query(`SELECT * FROM ${collectionName} WHERE username = $1`, [value]);
    }

    insertNotionIntegration(notionInt: INotionIntegration): Promise<QueryResult> {
        const text = `INSERT INTO ${this.notionIntegrationCollectionName}(bot_id, access_token, workspace_id, owner, workspace_name, workspace_icon, token_type, date_created) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        const values = [notionInt.botId, notionInt.accessToken, notionInt.workspaceId, notionInt.owner, notionInt.workspaceName, notionInt.workspaceIcon, notionInt.tokenType, notionInt.dateCreated];
        return this.query(text, values);
    }
    async getUserByUsername(username: string): Promise<QueryResult> {
        return this.get(this.usersCollectionName, username);
    }
}