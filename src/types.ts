import type { NextFunction, Request, Response, Router } from 'express';
import { Client } from '@notionhq/client';
import TelegramBot from 'node-telegram-bot-api';
import { Db } from './db';
import { BotLanguage } from './telegram-bot/bot-language';
import { Notion } from './services/notion';
import type { IUser } from './db/UsersTable';
import { Telegram } from './telegram-bot';

export interface IRouteContext {
	readonly env: Record<string, string>
	readonly telegramBot: TelegramBot;
	readonly db: Db;
}
export interface ITelegramContext {
	readonly env: Record<string, string>
	readonly telegramBot: TelegramBot;
	readonly db: Db;
	language: BotLanguage;
	notion?: Notion;
	user?: IUser;
}

export type TAppRouter = (
	context: IRouteContext,
) => Router | ((req: Request, res: Response, next: NextFunction) => void);

export type TTelegramMessageRouter = (
	telegram: Telegram,
	data: {
		msg: TelegramBot.Message,
		match?: RegExpExecArray | null
	}
) => void;

export type TTelegramCallbackQueryRouter = (
	telegram: Telegram,
	data: {
		callbackQuery: TelegramBot.CallbackQuery
	}
) => void;
export interface ITelegramIntegration {
	readonly userId: string;
	readonly firstName: string | undefined;
	readonly lastName: string | undefined;
	readonly username: string | undefined;
}