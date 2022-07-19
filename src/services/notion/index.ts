import { Client } from '@notionhq/client';
import { Db } from './../../db';
import { QueryResult } from 'pg';
import { INotionPlannerItemTypesProperty, INotionIntegration } from './../../types';
import { NotionApi } from './notion-api';
export class Notion extends NotionApi {
    private readonly db: Db;
    // private readonly integration: INotionIntegration;

    constructor(accessToken: string, db: Db) {
        super(accessToken);
        this.db = db;
        // this.integration = integrationDetails;
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

    addToInbox(plannerDatabaseId: string, text: string, typeId: string) {
        this.addItemToDatabase(plannerDatabaseId, {
            
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

    updatePlannerDatabaseId(userId: string, databaseId: string): Promise<QueryResult> {
        return this.db.updateNotionIntegrationPlannerDb(userId, databaseId);
    }

    updatePlannerItemTypes(userId: string, itemTypes: INotionPlannerItemTypesProperty): Promise<QueryResult> {
        return this.db.updateNotionIntegrationPlannerItemTypes(userId, itemTypes);
    }
}