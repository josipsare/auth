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
exports.getAuthToken = getAuthToken;
// authService.ts
const axios_1 = __importDefault(require("axios"));
function getAuthToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, axios_1.default)({
                method: 'POST',
                url: 'https://dev-uwezclgo7k3pt3iq.us.auth0.com/oauth/token',
                headers: { 'Content-Type': 'application/json' },
                data: {
                    client_id: "ABMLx6mwHRXdIN49V5BqtFQ2xBIF1LLG",
                    client_secret: "EOsXKT_mjmAxt-Lav7V3lSv0fwVkBbnRmpkGNWdtzxVoUltPQxdCujQ7NTowpjIv",
                    audience: 'http://127.0.0.1:10000/',
                    grant_type: 'client_credentials',
                },
            });
            return response.data.access_token;
        }
        catch (error) {
            console.error('Error fetching auth token:', error);
            throw error;
        }
    });
}
