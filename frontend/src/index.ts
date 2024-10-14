import express, { Request, Response } from 'express';
import path from 'path';
import QRCode from 'qrcode';
import User from './models/User';
import Ticket from "./models/Ticket"; // Import your models
import {config} from "dotenv";
import {makeAuthorizedApiCall} from "./services/apiService";
import {getAuthToken} from "./services/authService";

const app = express();
config()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded




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

        if (tickets.length > 3) {
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


app.get('/ticketDetails/:ticketId', async (req: Request<{ ticketId: string }>, res: Response) => {
    const ticketId = req.params.ticketId;

    try {
        const ticket = await Ticket.findOne({ where: { id: ticketId } });
        // @ts-ignore
        const user = await User.findOne({where: {vatin: ticket.vatin}})

        // @ts-ignore
        const createdAtFormatted = ticket.createdAt.toLocaleTimeString('en-GB', {
            timeZoneName: 'short'
        });

        if (ticket) {
            res.send(`
            <html>
                <body>
                    <h1>Details of your ticket</h1>
                    <p>Ticket is registered under:</p>
                    <p>First Name: ${user ? user.firstName : 'Unknown User'}</p>
                    <p>Last Name: ${user ? user.lastName : 'Unknown User'}</p>
                    <p>Vatin: ${user ? user.vatin : 'Unknown User'}</p>
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

    const url = `http://127.0.0.1:10000/ticketDetails/${ticketId}`;
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
        createdAt: new Date(),
        updatedAt: new Date()
    });

    console.log("Created ticket:", newTicket);

    res.json(newTicket);
});

app.get('/get', async (req, res) => {
    try {
        const users = await User.findAll();
        console.log(users);
        res.json(users);
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
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


const hostname = '127.0.0.1';
const port = process.env.PORT;

app.listen(Number(port), hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});