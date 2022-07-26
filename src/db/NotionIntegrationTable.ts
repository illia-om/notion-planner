import { PgTable } from './Table';
import { Pool } from 'pg';

export interface INotionIntegration {
	readonly bot_id: string;
	readonly access_token: string;
	readonly workspace_id: string;
	readonly owner: Record<string, string>;
	readonly workspace_name: string | null;
	readonly workspace_icon: string | null;
	readonly token_type: string | null;
	readonly date_created: Date;
	readonly planner_database_id: string | null;
	readonly planer_item_types: INotionPlannerItemTypesProperty | null;
}

export interface INotionPlannerItemTypesProperty {
	readonly id: string;
	readonly values: INotoinPlannerItemTypeValue[];
}

export interface INotoinPlannerItemTypeValue {
	readonly id: string,
	readonly name: string,
	readonly color: string
}

export class NotionIntegrationTable extends PgTable {
    constructor(pool: Pool) {
        super(pool, {
            tableName: 'notion_integration',
            primaryKey: 'bot_id'
        });
    }

    get(bot_id: string): Promise<INotionIntegration | undefined> {
        return super.get(bot_id);
    }

    // insert(item: INotionIntegration): Promise<INotionIntegration> {
    //     return super.insert(item);
    // }
}