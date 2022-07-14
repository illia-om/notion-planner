import {TAppRouter} from '../types';
import { users } from '../users';
import jwt from 'jsonwebtoken';

export const loginRoute: TAppRouter = (context) => {
    return (req, res) => {
        const { username, password } = req.body;
    
        const user = users.find(u => { return u.username === username && u.password === password });
    
        if (user) {
            const accessToken = jwt.sign({ username: user.username,  role: user.role }, context.env.SERVER_ACCESS_TOKEN_SECRET!);
    
            res.json({
                accessToken
            });
        } else {
            res.send('Username or password incorrect');
        }
    };
}