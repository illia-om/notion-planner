import { Db } from './../../db';
import { INotionPlannerItemTypesProperty, INotionIntegration } from './../../db/NotionIntegrationTable';
import { NotionApi } from './notion-api';

interface INotionServiceOptions {
    integration: INotionIntegration,
    db: Db
}
export class Notion extends NotionApi {
    private readonly db: Db;
    private integration: INotionIntegration;

    constructor(options: INotionServiceOptions) {
        super(options.integration.access_token);
        this.db = options.db
        this.integration = options.integration;
    }

    async determinePlannerDatabese() {
        const databases = await this.listAllDatabases() as any[];
        const plannedDb = databases.find(database => {
            return database.title[0].plain_text.toLowerCase() === 'planner';
        })
        if (plannedDb) {
            await this.updatePlannerDatabaseId(plannedDb.id);
            const types = await this.getPlannerItemTypes();
            if (types) {
                await this.updatePlannerItemTypes(types);
                return true;
            }
            return false;
        }
        return false;
    }

    async getPlannerItemTypes(): Promise<INotionPlannerItemTypesProperty | undefined> {
        if (!this.integration.planner_database_id) {
            return undefined;
        }
        const typeProperty = await this.getPropertyByName(this.integration.planner_database_id, 'type');
        if (typeProperty?.type !== 'select') {
            return undefined;
        }
        return {
            id: typeProperty.id,
            values: typeProperty.select.options
        };
    }

    addToInbox(text: string, typeId: string) {
        if (!this.integration.planner_database_id) {
            return undefined;
        }
        const typeProperty = {

        }
        this.addItemToDatabase(this.integration.planner_database_id, typeProperty)
    }

    updatePlannerDatabaseId(databaseId: string) {
        this.integration.planner_database_id = databaseId;
        return this.db.notionIntegration.update(this.integration.bot_id, {
            planner_database_id: databaseId
        });
    }

    updatePlannerItemTypes(itemTypes: INotionPlannerItemTypesProperty) {
        this.integration.planer_item_types = itemTypes;
        return this.db.notionIntegration.update(this.integration.bot_id, {
            planer_item_types: itemTypes
        });
    }
}