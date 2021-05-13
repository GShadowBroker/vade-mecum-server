import { IConfig } from '../types';

export default <IConfig>{
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || "development",
  tokenSecret: process.env.TOKEN_SECRET,
  cookieSecretKey: process.env.COOKIE_SECRET_KEY,
  tokenExpiration: 1000 * 60 * 60 * 24 * 3, // 3 days
};
