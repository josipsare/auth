//
//
// TODO dodati dio oko OIDC logina korisnika
//
//
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
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

const configg: ConfigParams = {
    authRequired: false, // Autentifikacija nije obavezna na svim rutama
    auth0Logout: false,
    secret: '9f7b0bbf78bac11d6de1618d0809b6e3d3663b869dbc2c3bce3865fd79db1441',
    baseURL: 'https://auth-3-t6fw.onrender.com',
    clientID: 'aEJavypbK5mTDhyFbB4BQ9JMqNasvEcF',
    issuerBaseURL: 'https://dev-uwezclgo7k3pt3iq.us.auth0.com'
};

app.use(auth(configg));

app.get('/', async (req:Request, res:Response) => {
    console.log("-------------------------------------");
    console.log("usli smo na index");
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
        console.log("Entered getTicket route.");
        console.log("Request body:", req.body);

        const data = req.body;

        console.log("Checking if user provided all fields");
        if (!data.vatin || !data.firstName || !data.lastName) {
            res.status(400).send('Missing required fields');
            return
        }

        console.log("Checking number of generated tickets under this VATIN");
        const tickets: Ticket[] = await Ticket.findAll({ where: { vatin: data.vatin } });
        console.log("Number of tickets:", tickets.length);

        if (tickets.length >= 3) {
            res.status(400).send("More than 3 tickets were generated under this VATIN.");
            return
        }

        console.log("Making authorized API call with data:", data);
        const result = await makeAuthorizedApiCall(data);
        console.log("API call result:", result);

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
    console.log("-------------------------------------");
    console.log("usli smo na generate qr");
    console.log(ticketId);

    const url = `https://auth-3-t6fw.onrender.com/ticketDetails/${ticketId}`;
    //TODO ovo promjenuti da odgovara URLu od rendera

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
    console.log("-------------------------------------");
    console.log("usli smo na secureTicket");
    console.log("ovo je req.body:", req.body);
    console.log("ovo je req.body as JSON:", JSON.stringify(req.body, null, 2));


    const newTicket = await Ticket.create({
        vatin: req.body.vatin,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log("Created ticket:", newTicket);

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


const hostname = '0.0.0.0'; // TODO ovo treba pominiti ako se radi lokalno
const port = process.env.PORT;

app.listen(Number(port), hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});