export class HttpException extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
        this.message = message;
    }
}
export class EmailUsedException extends HttpException {
    constructor(email) {
        super(400, `The e-mail '${email}' is already in use`);
    }
}
export class ModelIdNotFoundException extends HttpException {
    constructor(modelName, id) {
        super(404, `The ${modelName} id '${id}' was not found`);
    }
}
export class IncorrectTypeException extends HttpException {
    constructor(fieldName, expectedType, value) {
        super(400, `The field '${fieldName}' expected type '${expectedType}' but received '${typeof value}'`);
    }
}
export class IncorrectQueryException extends HttpException {
    constructor(queryName, expectedType, value) {
        super(400, `The query '${queryName}' expected type '${expectedType}' but received '${value}'`);
    }
}
