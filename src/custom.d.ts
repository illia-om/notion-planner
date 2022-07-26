declare namespace Express {
   export interface Request {
      user: import('./db/UsersTable').IUser;
      notionIntegration: import('./db/NotionIntegrationTable').INotionIntegration;
      userId: string;
   }
}