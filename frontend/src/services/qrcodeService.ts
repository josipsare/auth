import QRCode from "qrcode";


export interface QRCodeHTMLResponse {
    html: string;
}

export async function generateQRCodeHTML(ticketId: string): Promise<QRCodeHTMLResponse> {
    const ticketDetailsUrl = `https://auth-3-t6fw.onrender.com/ticketDetails/${ticketId}`;
    const qrCodeImageUrl = await QRCode.toDataURL(ticketDetailsUrl);

    return {
        html: `
            <html>
                <body>
                    <h1>QR code of your ticket</h1>
                    <img src="${qrCodeImageUrl}" alt="QR Code"/>
                    <p>Scan the QR code to access your ticket information.</p>
                    <a href="/">Home</a>
                </body>
            </html>
        `
    };
}