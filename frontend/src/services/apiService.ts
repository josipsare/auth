// apiService.ts
import axios from 'axios';
import { getAuthToken } from './authService';

export async function makeAuthorizedApiCall(data: any): Promise<any> {
    try {
        console.log("-------------------------------------");
        console.log("Entering makeAuthorizedApiCall");
        console.log("Data to be sent:", data);

        // Get the token from the auth service
        const token = await getAuthToken();
        console.log("Authorization token received");

        // Make the API request with the token in the Authorization header
        const response = await axios({
            method: 'POST',
            url: 'https://auth-3-t6fw.onrender.com:10000/secureTicket',
            //TODO ovo ce mozda trebati promjeniti kad se bude deployalo
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data,
        });

        console.log("Response data received from API:", response.data);
        return response.data;
    } catch (error) {
        console.error('Error making authorized API call:', error);
        throw error;
    }
}
