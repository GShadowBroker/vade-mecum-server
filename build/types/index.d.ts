import { User } from '.prisma/client';
import { Request } from 'express';
export declare type IEnv = 'production' | 'development';
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
export declare type IUserSafe = Omit<User, "password">;
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
export declare type IFilterUserRole = 'USER' | 'ADMIN' | undefined;
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
export interface IArtContentChildren {
    type: string;
    content: string;
}
export interface IArtContent {
    art: string | null;
    caput: string;
    children: Array<IArtContentChildren>;
}
export interface ISynopsis {
    type: string | null;
    content: string;
    children: Array<string | null>;
}
export interface ICrawlerResponse {
    title: string | undefined;
    description: string | undefined;
    header: Array<string>;
    footer: Array<string>;
    synopsis: Array<ISynopsis>;
    content: Array<IArtContent>;
}
export interface ILaw extends ICrawlerResponse {
    url: string;
}
export interface ICrawlOptions {
    url: string;
}
export interface ILawResponse {
    result: Array<ICrawlerResponse>;
    cached: boolean;
}
export interface ILawsList {
    [index: string]: string;
}
