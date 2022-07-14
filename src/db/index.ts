import { Pool, QueryResult } from 'pg';

const pool = new Pool();

type IDbQuery = (
    text: string,
    params: any[]
) => Promise<QueryResult>

export const query: IDbQuery = (text, params) => {
    return pool.query(text, params)
}