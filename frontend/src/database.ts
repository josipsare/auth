import { Sequelize } from 'sequelize';
import { config } from 'dotenv';
import { Ticket } from './models/initModels'; // Import models via initModels

config();

export const sequelize = new Sequelize({
    database: process.env.DB_NAME!,
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: parseInt(process.env.DB_PORT!, 10),
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});

async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Database connection successful!');

        // Sync database
        await sequelize.sync();
        console.log('Database synchronized!');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
}

connectToDatabase();
