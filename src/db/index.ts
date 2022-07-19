import { Pool, QueryResult } from 'pg';
import type { INotionIntegration, ITelegramIntegration } from './../types';

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

    async getRoleName(roleId: any): Promise<string | null> {
        const { rows } = await this.query(`SELECT * FROM ${this.rolesCollectionName} WHERE role_id = $1`, [roleId]);
        return rows[0].role_name || null;
    }

    updateUserNotionIntegration(username: string, notionIntegrationId: string): Promise<QueryResult> {
        const text = `UPDATE ${this.usersCollectionName} SET notion_integration_id = $1 WHERE username = $2 RETURNING *`;
        const values = [notionIntegrationId, username];
        return this.pool.query(text, values);
    }

    updateUserTelegramIntegration(username: string, telegramIntegrationId: string): Promise<QueryResult> {
        const text = `UPDATE ${this.usersCollectionName} SET telegram_chat_id = $1 WHERE username = $2 RETURNING *`;
        const values = [telegramIntegrationId, username];
        return this.pool.query(text, values);
    }

    updateNotionIntegrationPlannerDb(username: string, plannerDatabaseId: string): Promise<QueryResult> {
        const text = `
            UPDATE ${this.notionIntegrationCollectionName}
            SET planner_database_id = $1 
            WHERE bot_id =
            (SELECT notion_integration_id FROM ${this.usersCollectionName}
            WHERE username = $2)
            RETURNING *`;
        const values = [plannerDatabaseId, username];
        return this.pool.query(text, values);
    }

    insertNotionIntegration(notionInt: INotionIntegration): Promise<QueryResult> {
        const text = `INSERT INTO ${this.notionIntegrationCollectionName}(bot_id, access_token, workspace_id, owner, workspace_name, workspace_icon, token_type, date_created) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
        const values = [notionInt.botId, notionInt.accessToken, notionInt.workspaceId, notionInt.owner, notionInt.workspaceName, notionInt.workspaceIcon, notionInt.tokenType, notionInt.dateCreated];
        return this.query(text, values);
    }

    registerUser(userId: string): Promise<QueryResult> {
        const text = `INSERT INTO ${this.usersCollectionName}(username, role_id) VALUES($1, $2) RETURNING *`;
        const VISITOR_ROLE_ID = '846eda3b-dbea-44ad-abc2-7ebc108ea26d';
        const values = [userId, VISITOR_ROLE_ID];
        return this.query(text, values);
    }

    getUserByUsername(username: string): Promise<QueryResult> {
        return this.get(this.usersCollectionName, username);
    }

    getNotionIntegrationById(botId: string): Promise<QueryResult> {
        return this.query(`SELECT * FROM ${this.notionIntegrationCollectionName} WHERE bot_id = $1`, [botId]);
    }

    getTelegramIntegrationByChatId(ChatId: string): Promise<QueryResult> {
        return this.query(`SELECT * FROM ${this.telegramIntegrationCollectionName} WHERE user_id = $1`, [ChatId]);
    }

    insertTelegramIntegration(telegramInt: ITelegramIntegration): Promise<QueryResult> {
        const text = `INSERT INTO ${this.telegramIntegrationCollectionName}(user_id, first_name, last_name, username) VALUES($1, $2, $3, $4) RETURNING *`;
        const values = [telegramInt.userId, telegramInt.firstName, telegramInt.lastName, telegramInt.username];
        return this.query(text, values);
    }

    getNotionIntegrationByTelegramUserId(telegramUserId: string): Promise<QueryResult> {
        const text = `
        SELECT * FROM ${this.notionIntegrationCollectionName}
        WHERE bot_id =
        (SELECT notion_integration_id FROM ${this.usersCollectionName}
        WHERE telegram_chat_id = $1)`;
        const params = [telegramUserId];
        return this.query(text, params);
    }

    getNotionIntegrationByUserId(userId: string): Promise<QueryResult> {
        const text = `
        SELECT * FROM ${this.notionIntegrationCollectionName}
        WHERE bot_id =
        (SELECT notion_integration_id FROM ${this.usersCollectionName}
        WHERE username = $1)`;
        const params = [userId];
        return this.query(text, params);
    }
}