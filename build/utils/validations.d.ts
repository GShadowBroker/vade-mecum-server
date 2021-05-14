import { IUsersQueryModel, IFilterUsersModel, ICreateUserModel, IUserLogin } from '../types';
export declare const validateQueryUsers: (query: IUsersQueryModel) => IFilterUsersModel;
export declare const validateNewUser: (body: ICreateUserModel) => ICreateUserModel;
export declare const validateCredentials: (body: IUserLogin) => IUserLogin;
export declare const validateParamsId: (params: {
    id: string | undefined;
}) => number;
