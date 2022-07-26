import { Message, CallbackQuery } from 'node-telegram-bot-api';
import { Db } from '../db';
import TelegramBot from 'node-telegram-bot-api';
import type { TTelegramOptions, TLocale } from './types';
import { BotLanguage } from './bot-language';
import { IUser } from '../db/UsersTable';
import { Notion } from '../services/notion';

type TExtractTelegramUserId = (req: Message | CallbackQuery) => number | undefined;


export interface ITelegramContext {
    readonly env: Record<string, string>
    readonly telegramBot: TelegramBot;
    readonly db: Db;
    language: BotLanguage;
    notion?: Notion;
    user?: IUser;
}

export class Telegram {
    readonly bot: TelegramBot;
    readonly db: Db;
    readonly env: Record<string, string>;
    locale: TLocale;
    language: BotLanguage;
    user?: IUser;
    telegramUser?: object;
    notion?: Notion

    constructor(options: TTelegramOptions) {
        this.db = options.db;
        this.env = process.env as Record<string, string>;
        this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: true });
        this.locale = 'en';
        this.language = new BotLanguage(this.locale);
    }

    login(req: Message | CallbackQuery) {

    }

    async withUser(req: Message | CallbackQuery): Promise<boolean> {
        try {
            const telegramUserId = extractTelegramUserId(req);
            if (!telegramUserId) {
                return false;
            }
            const users = await this.db.users.getByTelegramConnection(telegramUserId);
            if (!users || users.length !== 1) {
                this.bot.sendMessage(telegramUserId, this.language.say('loginError'));
                return false;
            }
            this.user = users[0];
            return true;
        } catch (err) {
            console.log('Telegram .withUser ERROR: ', err);
            return false;
        }
    }

    async withNotion(req: Message | CallbackQuery): Promise<boolean> {
        try {
            const telegramUserId = extractTelegramUserId(req);
            if (!telegramUserId) {
                return false;
            }
            if (!this.user) {
                const loadUserReqult = await this.withUser(req);
                if (!loadUserReqult) {
                    return false;
                }
            }
            if (this.user?.notion_integration_id) {
                const notinIntegration = await this.db.notionIntegration.get(this.user.notion_integration_id);
                if (notinIntegration) {
                    const db = this.db;
                    this.notion = new Notion({
                        db,
                        integration: notinIntegration
                    })
                }
                return true;
            } else {
                this.bot.sendMessage(telegramUserId, this.language.say('noNotionConnection'));
                return false;
            }
        } catch (err) {
            console.log('Telegram .withNotion ERROR: ', err);
            return false;
        }
    }
}

export const isMessage = (req: unknown): req is Message => {
    return Boolean((req as Message).chat);
};

export const isCallbackQuery = (req: unknown): req is CallbackQuery => {
    return Boolean((req as CallbackQuery).chat_instance);
};

const extractTelegramUserId: TExtractTelegramUserId = (req) => {
    if (isMessage(req)) {
        return req.chat.id;
    }
    if (isCallbackQuery(req)) {
        return req.from.id;
    }
}