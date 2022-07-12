import type { NextFunction, Request, Response, Router } from 'express';
import { Client } from '@notionhq/client';
import TelegramBot from 'node-telegram-bot-api';
import { Pool } from 'pg';

export interface IRouteContext {
  readonly telegramBot: TelegramBot;
  readonly notion: Client;
  readonly pool: Pool;
}

export type TAppRouter = (
  routeContext: IRouteContext,
) => Router | ((req: Request, res: Response, next: NextFunction) => void);
