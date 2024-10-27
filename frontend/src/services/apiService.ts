
import axios from 'axios';
import { getAuthToken } from './authService';

export async function makeAuthorizedApiCall(data: any): Promise<any> {
    try {
        const token: string = await getAuthToken();

        const response = await axios({
            method: 'POST',
            url: 'https://auth-3-t6fw.onrender.com/secureTicket',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            data,
        });

        return response.data;
    } catch (error) {
        console.error('Error making authorized API call:', error);
        throw error;
    }
}
