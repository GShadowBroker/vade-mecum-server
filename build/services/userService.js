import { prisma } from '../server';
import { EmailUsedException, HttpException, ModelIdNotFoundException } from '../utils/exceptions';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config';
export default {
    getAll: (filters) => {
        let roleFilter;
        if (filters.role) {
            roleFilter = { role: filters.role };
        }
        else {
            roleFilter = {};
        }
        return prisma.user.findMany({
            where: roleFilter,
            skip: filters.offset || 0,
            take: filters.limit || 50
        });
    },
    getUserById: async (id) => {
        if (!id) {
            throw new ModelIdNotFoundException("user", id);
        }
        const user = await prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new ModelIdNotFoundException('user', id);
        }
        return user;
    },
    login: async (credentials) => {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) {
            throw new HttpException(403, "Authentication failed. Wrong or missing credentials.");
        }
        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
            throw new HttpException(403, "Authentication failed. Wrong or missing credentials.");
        }
        const userSafe = { ...user, password: undefined };
        const token = jwt.sign({
            ...userSafe,
            exp: Date.now() + config.tokenExpiration
        }, config.tokenSecret);
        return token;
    },
    createUser: async (user) => {
        const existingEmail = await prisma.user.findFirst({ where: { email: user.email } });
        if (existingEmail) {
            throw new EmailUsedException(user.email);
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        return prisma.user.create({
            data: {
                username: user.username,
                email: user.email,
                password: hashedPassword
            }
        });
    },
    removeUser: async (id) => {
        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            throw new ModelIdNotFoundException('user', id);
        }
        return prisma.user.delete({ where: { id } });
    }
};
