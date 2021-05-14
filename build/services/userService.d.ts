import { User } from '.prisma/client';
import { ICreateUserModel, IFilterUsersModel, IUserLogin } from '../types';
declare const _default: {
    getAll: (filters: IFilterUsersModel) => Promise<User[]>;
    getUserById: (id: number) => Promise<User>;
    login: (credentials: IUserLogin) => Promise<string>;
    createUser: (user: ICreateUserModel) => Promise<User | null>;
    removeUser: (id: number) => Promise<any>;
};
export default _default;
