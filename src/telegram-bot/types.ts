import { Db } from '../db';

export interface TTelegramOptions {
	db: Db;
}

export declare type TLocale = 'en' | 'ua' | 'ru';

export type TPhrases = Record<string, {
    en: string,
    ua?: string,
    ru?: string,
    params?: string[]
}>;