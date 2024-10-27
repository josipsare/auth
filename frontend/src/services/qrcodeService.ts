import QRCode from "qrcode";


export interface QRCodeHTMLResponse {
    html: string;
}

export async function generateQRCodeHTML(ticketId: string): Promise<string> {
    const ticketDetailsUrl = `https://auth-3-t6fw.onrender.com/ticketDetails/${ticketId}`;
    return await QRCode.toDataURL(ticketDetailsUrl);
}
