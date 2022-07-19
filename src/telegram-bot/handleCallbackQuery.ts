import { TTelegramCallbackQueryRouter } from './../types';
import { Client } from '@notionhq/client';

export const handleCallbackQuery: TTelegramCallbackQueryRouter = async (context, { callbackQuery }) => {
  try {
    console.log('handleCallbackQuery: ', callbackQuery);
    const parseRegExp = /(.*?):(.*)/gm;
    if (!callbackQuery.data) {
      return;
    }
    const match = parseRegExp.exec(callbackQuery.data);
    const itemType = match![1];
    const itemText = match![2];
    console.log({itemType, itemText});
    
  } catch (err) {
    console.log('handleCallbackQuery ERROR: ', err);
  }
}