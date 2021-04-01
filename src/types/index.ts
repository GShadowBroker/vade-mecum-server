import { User } from '.prisma/client';
import { Request } from 'express';

export type IEnv = 'production' | 'development';

export interface IConfig {
  port: number;
  env: IEnv;
  tokenSecret: string;
  tokenExpiration: number;
  cookieSecretKey: string;
}

export interface IParamsId {
  id: string | undefined;
}

export type IUserSafe = Omit<User, "password">;

export interface IUserLogin {
  email: string | undefined;
  password: string | undefined;
}

export interface IRequestUser extends Request {
  user: User | undefined;
}

export interface ICreateUserModel {
  username: string;
  email: string;
  password: string;
}

export type IFilterUserRole = 'USER' | 'ADMIN' | undefined;

export interface IUsersQueryModel {
  limit: string | undefined;
  offset: string | undefined;
  role: string | undefined;
}

export interface IFilterUsersModel {
  limit: number | undefined;
  offset: number | undefined;
  role: IFilterUserRole;
}

export interface IArt {
  art: string | null;
  caput: string | undefined;
  content: Array<string>;
}

export interface ITitles {
  title: string;
  content: string;
  arts: Array<string | null>;
}

export interface ICrawlerResponse {
  title: string | undefined;
  description: string | undefined;
  synopsis: Array<ITitles>;
  formattedContent: Array<IArt>;
}

export interface ICrawlOptions {
  url: string;
}

export interface ILAwResponse {
  result: Array<ICrawlerResponse>;
  cached: boolean;
}

export interface ILawsList {
  [index: string]: string;
}