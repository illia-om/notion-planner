import { Pool } from 'pg';

export interface IPgTableOptions {
    readonly tableName: string;
    readonly primaryKey: string;
}

export declare type IPgQueryObject = {
    columnId: string;
    value: any;
}

export class PgTable {
    private readonly pool: Pool;
    private readonly tableName: string;
    private readonly primaryKey: string;

    constructor(pool: Pool, options: IPgTableOptions) {
        this.pool = pool;
        this.tableName = options.tableName;
        this.primaryKey = options.primaryKey;
    }

    private async request(text: string, params: any[]) {
        try {
            const results = await this.pool.query(text, params);
            return results.rows
        } catch (err) {
            console.log('DB request ERROR: ', err);
        }
    }

    async get(id: typeof this.primaryKey) {
        const results = await this.request(`SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`, [id]);
        if (results?.length === 1) {
            return results[0];
        }
        return undefined;
    }

    async queryEq(queryObj: IPgQueryObject) {
        const results = await this.request(`SELECT * FROM ${this.tableName} WHERE ${queryObj.columnId} = $1`, [queryObj.value]);
        if (results && results.length > 0) {
            return results;
        }
        return undefined;
    }

    insert(item: Record<string, any>) {
        const fieldNames = Object.keys(item);
        const fieldValues = fieldNames.map(fieldName => item[fieldName])
        const fieldsString = `(${fieldNames.join(', ')}) VALUES(${fieldNames.map((_, i) => `$${i + 1}`).join(', ')})`;
        const text = `INSERT INTO ${this.tableName} ${fieldsString} RETURNING *`;
        const params = [...fieldValues];
        return this.request(text, params);
    }

    update(id: typeof this.primaryKey, item: Record<string, string | object | null>) {
        const fieldNames = Object.keys(item);
        const fieldValues = fieldNames.map(fieldName => item[fieldName])
        const fieldsString = fieldNames.map((fieldName, index) => `${fieldName} = $${index + 2}`).join(', ');
        const text = `UPDATE ${this.tableName} SET ${fieldsString} WHERE ${this.primaryKey} = $1 RETURNING *`;
        const params = [id, ...fieldValues];
        return this.request(text, params);
    }

}