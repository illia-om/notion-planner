import express, { Express, Request, Response } from 'express';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { Client } from '@notionhq/client';
import { Pool } from 'pg';
import {
  routeTest,
  loginRoute,
  telegramRoute,
  routeUser,
  notionRoute
} from './src/routes';
import {
  IRouteContext
} from './src/types';
import { authentication } from './src/middleware';
import {
  hendleStart,
  hendleMessage
} from './src/telegram-bot';
import { Db } from './src/db';

dotenv.config();

// const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });

const context: IRouteContext = {
  env: process.env as Record<string, string>,
  telegramBot: new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true }),
  // notion: new Client({
  //   auth: process.env.NOTION_ACCESS_TOKEN,
  // }),
  db: new Db(process.env.DATABASE_URL!)
}

const app: Express = express();

app
  .use(json())

  .get('/', (req: Request, res: Response) => {
    res.send(`Notion Planner App`);
  })

  .post('/login', loginRoute(context))

  .use(authentication(context))
  .use('/notion', notionRoute(context))
  // .use('/telegramBot/', telegramRoute(context))
  .use('/test', routeTest(context))
  .use('/users', routeUser(context))
  .listen(process.env.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
  });

context.telegramBot.on('message', (msg) => {
  hendleMessage(context, { msg });
});

context.telegramBot.onText(/\/start (.+)/, async (msg, match) => {
  hendleStart(context, { msg, match });
});