import type { TAppRouter } from './types';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const routeOAuth: TAppRouter = (context) => {
    return async (req, res) => {
        try {
            const code = req.query.code;
            let buff = new Buffer(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`);
            const result = await axios.post(`https://api.notion.com/v1/oauth/token`,
                {
                    grant_type: 'authorization_code',
                    code,
                    redirect_uri: process.env.AUTH_REDIRECT_URI
                },
                {
                    headers: {
                        Authorization: `Basic ${buff.toString('base64')}`,
                        'Content-Type': 'application/json'
                    }
                })

            console.log(result.data);
            // const dbClient = await context.pool.connect();
            // const r = await dbClient.query('SELECT * FROM test_table');
            res.json({ sucsess: true, data: 'Auth Successful' });
        } catch (err) {
            console.log('routeOAuth ERROR: ', err);
        }
    }
};