import { Client } from '@notionhq/client';

export class NotionApi {
    readonly client: Client;

    constructor(accessToken: string) {
        this.client = new Client({
            auth: accessToken,
        });
    }
    async listAllDatabases() {
        const { results: resources } = await this.listAllRecources();
        return resources.filter(resource => resource.object === 'database');
    }

    listAllRecources() {
        return this.client.search({});
    }

    getDatabase(databaseId: string) {
        return this.client.databases.retrieve({
            database_id: databaseId
        })
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
}