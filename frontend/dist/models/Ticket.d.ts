import { Model } from 'sequelize';
declare class Ticket extends Model {
    id: string;
    vatin: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
    updatedAt: Date;
}
export default Ticket;
