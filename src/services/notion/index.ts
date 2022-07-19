import { Client } from '@notionhq/client';
import { Db } from './../../db';
import { QueryResult } from 'pg';
import { INotionPlannerItemTypesProperty } from './../../types';

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

    getDatabase(databaseId: string) {
        return this.client.databases.retrieve({
            database_id: databaseId
        })
    }

    async getPlannerItemTypes(plannerDatabaseId: string) {
        const planner = await this.getDatabase(plannerDatabaseId);
        const parsePropertyName = (propertyName: string): string => propertyName.toLocaleLowerCase().trim();

        const properties = Object.keys(planner.properties).map(propertyName => ({ id: propertyName, parsedName: parsePropertyName(propertyName) }));
        const typePropertyId = properties.find(property => property.parsedName === 'type');
        if (!typePropertyId) {
            return undefined;
        }
        const typeProperty = planner.properties[typePropertyId.id];
        if (typeProperty.type !== 'select') {
            return undefined;
        }
        return {
            id: typeProperty.id,
            values: typeProperty.select.options
        };
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

    updatePlannerItemTypes(userId: string, itemTypes: INotionPlannerItemTypesProperty): Promise<QueryResult> {
        return this.db.updateNotionIntegrationPlannerItemTypes(userId, itemTypes);
    }
}