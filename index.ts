import express, { Express, Request, Response } from 'express';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import {
  routeTest,
  loginRoute,
  routeUser,
  notionRoute
} from './src/routes';
import {
  IRouteContext
} from './src/types';
import { authentication, loadUser, loadNotionIntegration } from './src/middleware';
import {
  Telegram,
  hendleStart,
  hendleMessage,
  handleCallbackQuery
} from './src/telegram-bot';
import { Db } from './src/db';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false }
});
const db = new Db(pool);
const telegram = new Telegram({ db })

telegram.bot.on('message', async (msg) => {
  hendleMessage(telegram, { msg });
});

telegram.bot.on('callback_query', (callbackQuery) => {
  handleCallbackQuery(telegram, { callbackQuery });
});

telegram.bot.onText(/\/start (.+)/, async (msg, match) => {
  hendleStart(telegram, { msg, match });
});

const context: IRouteContext = {
  telegramBot: telegram.bot,
  db,
  env: process.env as Record<string, string>
}

const app: Express = express();

app
  .use(json())

  .get('/', (req: Request, res: Response) => {
    res.send(`Notion Planner App`);
  })
  .post('/webhook', (req, res) => {
    const body = req.body;
    console.log('webhook: ', body);
    res.sendStatus(200);
  })
  .post('/login', loginRoute(context))

  .use(authentication(context))
  .use('/notion', notionRoute(context))
  .use('/test', loadUser(context), loadNotionIntegration(context), routeTest(context))
  .use('/users', routeUser(context))
  .listen(process.env.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
  });