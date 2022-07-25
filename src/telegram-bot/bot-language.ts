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



const PHRASES: TPhrases = {
    errorMessage: {
        en: 'Something went wrong...'
    },
    noNotionConnection: {
        en: `You don't have notion integration installed.\nPlease visit our website to continue.\nhttps://illiaom.editorx.io/notion-planner/`
    }
};