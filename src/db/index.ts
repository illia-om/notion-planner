import { Pool, QueryResult } from 'pg';

export class Db {
    private readonly pool: Pool;

    constructor(databaseUrl: string) {
        this.pool = new Pool({
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false }
        });
    }

    query(text: string, params: any[]): Promise<QueryResult> {
        return this.pool.query(text, params)
    }

    async getUserByUsername(username: string): Promise<QueryResult> {
        return this.query('SELECT * FROM users WHERE username = $1', [username]);
    }
}