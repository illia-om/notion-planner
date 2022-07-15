import { TAppRouter } from '../types';
import jwt from 'jsonwebtoken';

export const loginRoute: TAppRouter = (context) => {
    return async (req, res) => {
        try {
            const { username, password } = req.body;

            if (username && password) {
                const { rows: users } = await context.db.getUserByUsername(username);

                if (users.length > 0) {
                    const user = users[0];
                    if (user.password === password) {
                        const accessToken = jwt.sign({ username: user.username, roleId: user.role_id, notionIntegrationId: user.notion_integration_id }, context.env.SERVER_ACCESS_TOKEN_SECRET!);
    
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