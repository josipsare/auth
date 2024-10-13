
import express from 'express';
import path from 'path';
import { sequelize } from './database'; // Adjust the path accordingly
import User from './models/User';
import Ticket from "./models/Ticket"; // Import your models
import {config} from "dotenv";

const app = express();
config()
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    console.log("usli smo na index");
    let numOfTickets: number = 0;
    try {
        numOfTickets = await Ticket.count();
        console.log(numOfTickets);
    } catch (err) {
        console.log(err);
        res.sendStatus(500); // Return a 500 status code for server errors
    }
    res.render('index', { numOfTickets });// Pass numOfTickets to the view
});

app.get('/get', async (req, res) => {
    try {
        const users = await User.findAll();
        console.log(users);
        res.json(users); // Send the users as a JSON response
    } catch (err) {
        console.log(err);
        res.sendStatus(500); // Return a 500 status code for server errors
    }
});

const hostname = '127.0.0.1';
const port = process.env.PORT;

app.listen(Number(port), hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});