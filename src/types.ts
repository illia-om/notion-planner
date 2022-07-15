import type { NextFunction, Request, Response, Router } from 'express';
import { Client } from '@notionhq/client';
import TelegramBot from 'node-telegram-bot-api';
import { Db } from './db';

export interface IRouteContext {
	readonly env: Record<string, string>
	readonly telegramBot: TelegramBot;
	readonly notion: Client;
	readonly db: Db;
}

export type TAppRouter = (
	routeContext: IRouteContext,
) => Router | ((req: Request, res: Response, next: NextFunction) => void);

export interface INotionIntegration {
	readonly botId: string;
	readonly accessToken: string;
	readonly workspaceId: string;
	readonly owner: Record<string, string>;
	readonly workspaceName: string;
	readonly workspaceIcon: string;
	readonly tokenType: string;
	readonly dateCreated: Date;
}