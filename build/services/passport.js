import { prisma } from '../server';
import config from '../config';
import passportJwt from 'passport-jwt';
import { HttpException } from '../utils/exceptions';
const JwtStrategy = passportJwt.Strategy;
const cookieExtractor = (req) => {
    let jwt = null;
    if (req && req.cookies) {
        jwt = req.cookies['ssid'];
    }
    return jwt;
};
export default (passport) => {
    const opts = {
        jwtFromRequest: cookieExtractor,
        secretOrKey: config.tokenSecret
    };
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        if (!jwt_payload.exp || Date.now() > jwt_payload.exp) {
            done(new HttpException(403, "Invalid auth token"), false);
        }
        prisma.user.findUnique({ where: { id: jwt_payload.id } })
            .then((user) => {
            if (user) {
                done(null, user);
            }
            else {
                done(null, false);
            }
        })
            .catch(err => done(err, false));
    }));
};
