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
//
//
// TODO dodati dio oko OIDC logina korisnika
//
//
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const qrcode_1 = __importDefault(require("qrcode"));
const Ticket_1 = __importDefault(require("./models/Ticket")); // Import your models
const dotenv_1 = require("dotenv");
const apiService_1 = require("./services/apiService");
const authService_1 = require("./services/authService");
const app = (0, express_1.default)();
(0, dotenv_1.config)();
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express_1.default.json()); // For parsing application/json
app.use(express_1.default.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("-------------------------------------");
    console.log("usli smo na index");
    let numOfTickets = 0;
    try {
        numOfTickets = yield Ticket_1.default.count();
        console.log(numOfTickets);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
    res.render('index', { numOfTickets });
}));
app.post('/getTicket', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("Entered getTicket route.");
        console.log("Request body:", req.body);
        const data = req.body;
        console.log("Checking if user provided all fields");
        if (!data.vatin || !data.firstName || !data.lastName) {
            res.status(400).send('Missing required fields');
            return;
        }
        console.log("Checking number of generated tickets under this VATIN");
        const tickets = yield Ticket_1.default.findAll({ where: { vatin: data.vatin } });
        console.log("Number of tickets:", tickets.length);
        if (tickets.length > 3) {
            res.status(400).send("More than 3 tickets were generated under this VATIN.");
            return;
        }
        console.log("Making authorized API call with data:", data);
        const result = yield (0, apiService_1.makeAuthorizedApiCall)(data);
        console.log("API call result:", result);
        res.redirect(`/generate-qr/${result.id}`);
    }
    catch (error) {
        console.error("Error in getTicket route:", error);
        res.status(500).send('Failed to make authorized API call. ' + error);
        return;
    }
}));
app.get('/ticketDetails/:ticketId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ticketId = req.params.ticketId;
    try {
        const ticket = yield Ticket_1.default.findOne({ where: { id: ticketId } });
        // @ts-ignore
        // @ts-ignore
        const createdAtFormatted = ticket.createdAt.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZoneName: 'short',
            hour12: false // Use 24-hour format
        });
        if (ticket) {
            res.send(`
            <html>
                <body>
                    <h1>Details of your ticket</h1>
                    <p>Ticket is registered under:</p>
                    <p>First Name: ${ticket ? ticket.firstName : 'Unknown User'}</p>
                    <p>Last Name: ${ticket ? ticket.lastName : 'Unknown User'}</p>
                    <p>Vatin: ${ticket ? ticket.vatin : 'Unknown User'}</p>
                    <p>Ticket was generated at ${createdAtFormatted}</p>
                </body>
            </html>
        `);
        }
        else {
            res.status(404).send('Ticket not found');
        }
    }
    catch (error) {
        console.error('Error retrieving ticket:', error);
        res.status(500).send('Failed to retrieve ticket');
    }
}));
app.get('/generate-qr/:ticketId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { ticketId } = req.params;
    console.log("-------------------------------------");
    console.log("usli smo na generate qr");
    console.log(ticketId);
    const url = `http://127.0.0.1:10000/ticketDetails/${ticketId}`;
    //TODO ovo promjenuti da odgovara URLu od rendera
    try {
        const qrCodeImageUrl = yield qrcode_1.default.toDataURL(url);
        res.send(`
            <html>
                <body>
                    <h1>QR code of your ticket</h1>
                    <img src="${qrCodeImageUrl}" alt="QR Code"/>
                    <p>Scan the QR code to access your ticket information.</p>
                    <a href="/">Home</a>
                </body>
            </html>
        `);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Failed to generate QR code.');
    }
}));
app.post('/secureTicket', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("-------------------------------------");
    console.log("usli smo na secureTicket");
    console.log("ovo je req.body:", req.body);
    console.log("ovo je req.body as JSON:", JSON.stringify(req.body, null, 2));
    const newTicket = yield Ticket_1.default.create({
        vatin: req.body.vatin,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        createdAt: new Date(),
        updatedAt: new Date()
    });
    console.log("Created ticket:", newTicket);
    res.json(newTicket);
}));
app.get('/getToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield (0, authService_1.getAuthToken)();
        console.log(token);
        res.sendStatus(200);
    }
    catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}));
const hostname = '127.0.0.1';
const port = process.env.PORT;
app.listen(Number(port), hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
