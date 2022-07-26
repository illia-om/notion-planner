import { PgTable } from './Table';
import { Pool } from 'pg';
import type {IPgQueryObject} from './Table';

export interface IUser {
	readonly username: string;
	readonly role_id: string;
	readonly settings: object;
	readonly notion_integration_id: string | null;
	readonly telegram_chat_id: string | null;
}

export interface IUserWithPassword extends IUser {
	readonly password: string;
}

export class UsersTable extends PgTable {
    constructor(pool: Pool) {
        super(pool, {
            tableName: 'users',
            primaryKey: 'username'
        });
    }

    async get(username: string): Promise<IUser | undefined> {
        const user = await super.get(username);
        if (user) {
            delete user.password
            return user;
        }
        return undefined;
    }

    async getWithPassword(username: string): Promise<IUserWithPassword | undefined> {
        return super.get(username);
    }

    async queryEq(queryObj: IPgQueryObject): Promise<IUser[] | undefined> {
        const users = await super.queryEq(queryObj);
        if (users) {
            users.forEach(user => {
                delete user.password
            })
            return users;
        }
        return undefined;
    }

    getByTelegramConnection(telegramUserId: number) {
        return this.queryEq({
            columnId: 'telegram_chat_id',
            value: String(telegramUserId)
        })
    }

    getByNotionConnection(notionIntegrationId: string) {
        return this.queryEq({
            columnId: 'notion_integration_id',
            value: notionIntegrationId
        })
    }

    saveTelegramConnection(userId: string, telegramUserId: number) {
        return this.update(userId, {
            telegram_chat_id: String(telegramUserId)
        });
    }

    saveNotionConnection(userId: string, notoinBotId: string) {
        return this.update(userId, {
            notion_integration_id: notoinBotId
        });
    }

    createUser(userId: string, roleId?: string) {
        const VISITOR_ROLE_ID = '846eda3b-dbea-44ad-abc2-7ebc108ea26d';
        return this.insert({
            username: userId,
            role_id: roleId || VISITOR_ROLE_ID
        });
    }
}