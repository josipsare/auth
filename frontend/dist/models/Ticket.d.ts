import { Model } from 'sequelize';
declare class Ticket extends Model {
    id: string;
    vatin: string;
    createdAt: Date;
    updatedAt: Date;
}
export default Ticket;
