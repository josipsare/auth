// authService.ts
import axios from 'axios';

export async function getAuthToken(): Promise<string> {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://dev-uwezclgo7k3pt3iq.us.auth0.com/oauth/token',
            headers: { 'Content-Type': 'application/json' },
            data: {
                client_id: "ABMLx6mwHRXdIN49V5BqtFQ2xBIF1LLG",
                client_secret: "EOsXKT_mjmAxt-Lav7V3lSv0fwVkBbnRmpkGNWdtzxVoUltPQxdCujQ7NTowpjIv",
                audience: 'http://127.0.0.1:10000/', //TODO ovo ce mozda trebati promjeniti kad se bude deployalo
                grant_type: 'client_credentials',
            },
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error fetching auth token:', error);
        throw error;
    }
}
