import express from 'express';
import userService from '../../services/userService';
import { HttpException } from '../../utils/exceptions';
import { validateParamsId, validateQueryUsers } from '../../utils/validations';
import passport from 'passport';
import { prisma } from '../../server';
const router = express.Router();
router.get('/test', passport.authenticate('jwt', { session: false }), (req, res, _next) => {
    console.log(`user`, JSON.stringify(req.user, null, 2));
    return res.status(200).json({ user: req.user });
});
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const filters = validateQueryUsers(req.query);
        const users = await userService.getAll(filters);
        const allUsers = users.map((user) => ({ ...user, password: undefined }));
        return res.status(200).json(allUsers);
    }
    catch (error) {
        return next(error);
    }
});
router.get('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        const id = validateParamsId(req.params);
        const user = await userService.getUserById(id);
        return res.status(200).json({ ...user, password: undefined });
    }
    catch (error) {
        return next(error);
    }
});
router.put('/promote/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN') {
            throw new HttpException(403, "Unauthorized action");
        }
        const id = validateParamsId(req.params);
        const promotedUser = await prisma.user.update({
            where: {
                id
            },
            data: {
                role: "ADMIN"
            }
        });
        if (!promotedUser) {
            throw new HttpException(400, "Failed promoting user to admin. Please check whether user exists.");
        }
        return res.status(201).json({ success: true });
    }
    catch (error) {
        return next(error);
    }
});
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req, res, next) => {
    try {
        if (req.user.role !== 'ADMIN' && Number(req.user.id) !== Number(req.params.id)) {
            throw new HttpException(403, "Unauthorized action");
        }
        const id = validateParamsId(req.params);
        await userService.removeUser(id);
        return res.status(204).end();
    }
    catch (error) {
        return next(error);
    }
});
export default router;
