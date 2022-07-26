import { Client } from '@notionhq/client';

declare type TPropertyType = 'title' | 'rich_text' | 'number' | 'select' | 'multi_select' | 'date' | 'people' | 'files' | 'checkbox' | 'url' | 'email' | 'phone_number' | 'formula' | 'relation' | 'rollup' | 'created_time' | 'created_by' | 'last_edited_time' | 'last_edited_by' | 'status';
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

    createTitle(text: string) {
        return {
            // type: ''
            // content:
            // id:
        }
    }

    createProperty(type: TPropertyType) {

    }

    async getPropertyByName(databaseId: string, propertyName: string) {
        const database = await this.getDatabase(databaseId);
        const parsePropertyName = (propertyName: string): string => propertyName.toLocaleLowerCase().trim();

        const properties = Object.keys(database.properties).map(propertyName => ({ id: propertyName, parsedName: parsePropertyName(propertyName) }));
        const neddedPropertyId = properties.find(property => property.parsedName === parsePropertyName(propertyName));
        if (!neddedPropertyId) {
            return undefined;
        }
        const neddedProperty = database.properties[neddedPropertyId.id];
        // if (neddedProperty.type !== 'select') {
        //     return undefined;
        // }
        return neddedProperty;
        // return {
        //     id: neddedProperty.id,
        //     values: neddedProperty.select.options
        // };
    }
}