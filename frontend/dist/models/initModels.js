"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Ticket_1 = __importDefault(require("./Ticket"));
exports.Ticket = Ticket_1.default;
// Set up associations
User_1.default.hasMany(Ticket_1.default, { foreignKey: 'vatin', sourceKey: 'vatin' });
Ticket_1.default.belongsTo(User_1.default, { foreignKey: 'vatin', targetKey: 'vatin' });
