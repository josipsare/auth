
//https://auth-3-t6fw.onrender.com
import express, { Request, Response } from 'express';
import path from 'path';
import Ticket from "./models/Ticket";
import {config} from "dotenv";
import {makeAuthorizedApiCall} from "./services/apiService";
import { auth, requiresAuth, ConfigParams } from 'express-openid-connect';
import { generateQRCodeHTML, QRCodeHTMLResponse } from "./services/qrcodeService"
import {TicketRequestBody} from "./types/TicketRequestBody"
import {SecureTicketRequestBody} from "./types/SecureTicketRequestBody";

const app = express();
config()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const configg: ConfigParams = {
    authRequired: false,
    auth0Logout: false,
    secret: process.env.AUTH_SECRET,
    baseURL: process.env.BASE_URL,
    clientID: process.env.OIDC_CLIENT_ID,
    issuerBaseURL: process.env.ISSUER_BASE_URL
};

app.use(auth(configg));

app.get('/', async (req:Request, res:Response) => {
    let numOfTickets: number = 0;
    try {
        numOfTickets = await Ticket.count();
        console.log(numOfTickets);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
    res.render('index', { numOfTickets });
});

app.post('/getTicket', async (req: Request<{}, {}, TicketRequestBody>, res: Response): Promise<void> => {
    try {
        const data = req.body;
        if (!data.vatin || !data.firstName || !data.lastName) {
            res.status(400).send('Missing required fields');
            return
        }
        const ticketCount: number = await Ticket.count({ where: { vatin: data.vatin } });
        if (ticketCount >= 3) {
            res.status(400).send("More than 3 tickets were generated under this VATIN.");
            return;
        }
        const result = await makeAuthorizedApiCall(data);
        const qrCodeImageUrl = await generateQRCodeHTML(result.id);

        res.render('qrcode', { qrCodeImageUrl });
    } catch (error) {
        console.error("Error in getTicket route:", error);
        res.status(500).send('Failed to make authorized API call. ' + error);
        return
    }
});


app.get('/ticketDetails/:ticketId', requiresAuth(), async (req: Request<{ ticketId: string }>, res: Response) => {
    const ticketId = req.params.ticketId;

    try {
        const ticket = await Ticket.findOne({ where: { id: ticketId } });
        if (ticket) {
            const createdAtFormatted = ticket.createdAt.toLocaleString('en-GB', {
                timeZone: 'CET',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                timeZoneName: 'short',
                hour12: false
            });

            res.render('ticketInfo', {
                userName: req.oidc.user?.name || 'Unknown User',
                firstName: ticket.firstName || 'Unknown User',
                lastName: ticket.lastName || 'Unknown User',
                vatin: ticket.vatin || 'Unknown User',
                createdAtFormatted
            });
        } else {
            res.status(404).send('Ticket not found');
        }
    } catch (error) {
        console.error('Error retrieving ticket:', error);
        res.status(500).send('Failed to retrieve ticket');
    }
});

app.post('/secureTicket', async (req: Request<{}, {}, SecureTicketRequestBody>, res: Response) => {
    try {
        const newTicket = await Ticket.create({
            vatin: req.body.vatin,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        res.json(newTicket);
    } catch (error) {
        console.error("Error in secureTicket route:", error);
        res.status(500).send('Failed to create ticket');
    }
});

const hostname = '0.0.0.0';
const port = process.env.PORT;

app.listen(Number(port), hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});