import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../utils/exceptions';
declare const _default: (err: HttpException, _req: Request, res: Response, _next: NextFunction) => Response<any, Record<string, any>>;
export default _default;
