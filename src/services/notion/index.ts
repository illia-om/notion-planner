import { Client } from '@notionhq/client';
import { Db } from './../../db';
import { QueryResult } from 'pg';

export class Notion {
    private readonly client: Client;
    private readonly db: Db;

    constructor(accessToken: string, db: Db) {
        this.client = new Client({
            auth: accessToken,
        });
        this.db = db;
    }
    async listAllDatabases() {
        const { results: resources } = await this.listAllRecources();
        return resources.filter(resource => resource.object === 'database');
    }

    listAllRecources() {
        return this.client.search({});
    }

    addItemToDatabase(databaseId: string, itemProperties: any) {
        return this.client.pages.create({
            parent: {
                type: 'database_id',
                database_id: databaseId
            },
            properties: itemProperties
        })
    }

    updatePlannerDatabaseId(userId: string, databaseId: string): Promise<QueryResult> {
        return this.db.updateNotionIntegrationPlannerDb(userId, databaseId);
    }
}