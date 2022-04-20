"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerInternalError = void 0;
class ServerInternalError extends Error {
    constructor() {
        super('Server internal error');
    }
}
exports.ServerInternalError = ServerInternalError;
