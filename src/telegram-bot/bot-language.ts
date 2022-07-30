import type { TLocale, TPhrases } from './types';

export class BotLanguage {
    private readonly locale: TLocale;

    constructor(locale: TLocale) {
        this.locale = locale;
    }

    say(phraseId: string, params?: string[]) {
        if (PHRASES.hasOwnProperty(phraseId)) {
            const phrase = PHRASES[phraseId];
            if (phrase.hasOwnProperty(this.locale)) {
                return phrase[this.locale]!
            }
            return phrase['en'];
        }
        return 'Something went wrong...\nError: 001';
    }
}

const WEBSITE_URL = 'https://illiaom.wixsite.com/notion';

const PHRASES: TPhrases = {
    errorMessage: {
        en: 'Sorry, something went wrong...'
    },
    loginError: {
        en: `You are not logged in 😕\nPlease visit our website to create an account.\n${WEBSITE_URL}`
    },
    notLoggerIn: {
        en: `You are not logged in 😕\nPlease visit our website to create an account.\n${WEBSITE_URL}`
    },
    noNotionConnection: {
        en: `You don't have notion integration installed.\nPlease visit our website to continue.\n${WEBSITE_URL}`
    },
    noNotionItemTypes: {
        en: `Your connected notion planner don't have item types.\nPlease visit our website to reconnect notion.\n${WEBSITE_URL}`
    },
    addedToPlanner: {
        en: `New item successfully added to the inbox!`
    }
};