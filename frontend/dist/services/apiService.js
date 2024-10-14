"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthorizedApiCall = makeAuthorizedApiCall;
// apiService.ts
const axios_1 = __importDefault(require("axios"));
const authService_1 = require("./authService");
function makeAuthorizedApiCall(data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("-------------------------------------");
            console.log("Entering makeAuthorizedApiCall");
            console.log("Data to be sent:", data);
            // Get the token from the auth service
            const token = yield (0, authService_1.getAuthToken)();
            console.log("Authorization token received");
            // Make the API request with the token in the Authorization header
            const response = yield (0, axios_1.default)({
                method: 'POST',
                url: 'http://127.0.0.1:10000/secureTicket',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                data,
            });
            console.log("Response data received from API:", response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error making authorized API call:', error);
            throw error;
        }
    });
}
