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
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const User_1 = __importDefault(require("./models/User"));
const Ticket_1 = __importDefault(require("./models/Ticket")); // Import your models
const app = (0, express_1.default)();
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("usli smo na index");
    let numOfTickets = 0;
    try {
        numOfTickets = yield Ticket_1.default.count();
        console.log(numOfTickets);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500); // Return a 500 status code for server errors
    }
    res.render('index', { numOfTickets }); // Pass numOfTickets to the view
}));
app.get('/get', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield User_1.default.findAll();
        console.log(users);
        res.json(users); // Send the users as a JSON response
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500); // Return a 500 status code for server errors
    }
}));
const hostname = '127.0.0.1';
const port = 4040;
app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
