declare namespace Express {
    export interface Request {
       user: import('./routes/middlewareAuth').IUser
    }
 }