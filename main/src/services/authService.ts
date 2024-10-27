
import axios from 'axios';
import {config} from "dotenv";


config()
export async function getAuthToken(): Promise<string> {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://dev-uwezclgo7k3pt3iq.us.auth0.com/oauth/token',
            headers: { 'Content-Type': 'application/json' },
            data: {
                client_id: process.env.CLIENT_ID,
                client_secret: process.env.CLIENT_SECRET,
                audience: 'https://dev-uwezclgo7k3pt3iq.us.auth0.com/api/v2/',
                grant_type: 'client_credentials',
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching auth token:', error);
        throw error;
    }
}
