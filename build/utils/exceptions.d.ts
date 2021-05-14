export declare class HttpException extends Error {
    status: number;
    message: string;
    constructor(status: number, message: string);
}
export declare class EmailUsedException extends HttpException {
    constructor(email: string);
}
export declare class ModelIdNotFoundException extends HttpException {
    constructor(modelName: string, id: number);
}
export declare class IncorrectTypeException extends HttpException {
    constructor(fieldName: string, expectedType: string, value: any);
}
export declare class IncorrectQueryException extends HttpException {
    constructor(queryName: string, expectedType: string, value: any);
}
