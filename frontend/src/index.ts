
//https://auth-3-t6fw.onrender.com
import express, { Request, Response } from 'express';
import path from 'path';
import QRCode from 'qrcode';
import Ticket from "./models/Ticket"; // Import your models
import {config} from "dotenv";
import {makeAuthorizedApiCall} from "./services/apiService";
import {getAuthToken} from "./services/authService";
import { auth, requiresAuth, ConfigParams } from 'express-openid-connect';

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

interface TicketRequestBody {
    vatin: string;
    firstName: string;
    lastName: string;
}



app.post('/getTicket', async (req: Request<{}, {}, TicketRequestBody>, res: Response): Promise<void> => {
    try {
        const data = req.body;


        if (!data.vatin || !data.firstName || !data.lastName) {
            res.status(400).send('Missing required fields');
            return
        }

        const tickets: Ticket[] = await Ticket.findAll({ where: { vatin: data.vatin } });


        if (tickets.length >= 3) {
            res.status(400).send("More than 3 tickets were generated under this VATIN.");
            return
        }


        const result = await makeAuthorizedApiCall(data);


        res.redirect(`/generate-qr/${result.id}`);
    } catch (error) {
        console.error("Error in getTicket route:", error);
        res.status(500).send('Failed to make authorized API call. ' + error);
        return
    }
});


app.get('/ticketDetails/:ticketId',requiresAuth(), async (req: Request<{ ticketId: string }>, res: Response) => {
    const ticketId = req.params.ticketId;

    try {
        const ticket = await Ticket.findOne({ where: { id: ticketId } });




        // @ts-ignore
        const createdAtFormatted = ticket.createdAt.toLocaleString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            timeZoneName: 'short',
            hour12: false
        });

        if (ticket) {
            res.send(`
            <html lang="html5">
                <body>
                    <h1>Dobrodošli korisniče: ${req.oidc.user?.name}</h1>
                    <h1>Details of your ticket</h1>
                    <p>Ticket is registered under:</p>
                    <p>First Name: ${ticket ? ticket.firstName : 'Unknown User'}</p>
                    <p>Last Name: ${ticket ? ticket.lastName : 'Unknown User'}</p>
                    <p>Vatin: ${ticket ? ticket.vatin : 'Unknown User'}</p>
                    <p>Ticket was generated at ${createdAtFormatted}</p>
                </body>
            </html>
        `);
        } else {
            res.status(404).send('Ticket not found');
        }
    } catch (error) {
        console.error('Error retrieving ticket:', error);
        res.status(500).send('Failed to retrieve ticket');
    }
});

app.get('/generate-qr/:ticketId', async (req, res) => {
    const { ticketId } = req.params;

    const url = `https://auth-3-t6fw.onrender.com/ticketDetails/${ticketId}`;

    try {

        const qrCodeImageUrl = await QRCode.toDataURL(url);

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
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to generate QR code.');
    }
});

app.post('/secureTicket', async (req, res) => {

    const newTicket = await Ticket.create({
        vatin: req.body.vatin,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    res.json(newTicket);
});

app.get('/getToken', async (req, res) => {
    try {
        const token = await getAuthToken();
        console.log(token);
        res.sendStatus(200)
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
});


const hostname = '0.0.0.0';
const port = process.env.PORT;

app.listen(Number(port), hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});