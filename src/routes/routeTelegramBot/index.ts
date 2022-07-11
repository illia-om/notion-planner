import { TAppRouter } from './../types';
import { Router } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export const routeTelegramBot: TAppRouter = (context) => {
    const router = Router();

    return router
        .post('/togglePulling', (req, res) => {
            if (context.telegramBot.isPolling()) {
                context.telegramBot.stopPolling();
                res.json({
                    success: true,
                    telegramBotPullingStatus: 'pulling'
                });
            } else {
                context.telegramBot.startPolling({ restart: true });
                res.json({
                    success: true,
                    telegramBotPullingStatus: 'not-pulling'
                });
            }
        })
};