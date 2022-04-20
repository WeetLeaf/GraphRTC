"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = void 0;
const core_1 = __importDefault(require("@pothos/core"));
const plugin_simple_objects_1 = __importDefault(require("@pothos/plugin-simple-objects"));
const plugin_validation_1 = __importDefault(require("@pothos/plugin-validation"));
exports.builder = new core_1.default({
    plugins: [plugin_simple_objects_1.default, plugin_validation_1.default],
    defaultInputFieldRequiredness: true,
});
// This initializes the query and mutation types so that we can add fields to them dynamically:
exports.builder.queryType({});
exports.builder.mutationType({});
exports.builder.subscriptionType({});
exports.builder.scalarType("Date", {
    serialize: (date) => date.toISOString(),
    parseValue: (date) => new Date(date),
});
