import { TAppRouter } from '../types';
import jwt from 'jsonwebtoken';

export const loginRoute: TAppRouter = (context) => {
    return async (req, res) => {
        try {
            const { username, password } = req.body;

            if (username && password) {
                const user = await context.db.users.getWithPassword(username);

                if (user) {
                    if (user.password === password) {
                        const accessToken = jwt.sign({ username: user.username }, context.env.SERVER_ACCESS_TOKEN_SECRET!);
    
                        res.json({
                            accessToken
                        });
                    } else {
                        res.send('Username or password incorrect');
                    }
                } else {
                    res.send('User is not registered');
                }
            } else {
                res.sendStatus(401);
            }
        } catch (err) {
            console.log('loginRoute ERROR: ', err);
            return res.sendStatus(500);
        }
    };
}