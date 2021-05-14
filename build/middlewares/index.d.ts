/// <reference types="qs" />
/// <reference types="express" />
declare const _default: {
    errorHandler: (err: import("../utils/exceptions").HttpException, _req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, _next: import("express").NextFunction) => import("express").Response<any, Record<string, any>>;
    unknownEndpoint: (_req: import("express").Request<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>, res: import("express").Response<any, Record<string, any>>, _next: import("express").NextFunction) => import("express").Response<any, Record<string, any>>;
};
export default _default;
