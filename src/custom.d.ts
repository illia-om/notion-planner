declare namespace Express {
   export interface Request {
      user: import('./middleware/authentication').IUser
   }
}