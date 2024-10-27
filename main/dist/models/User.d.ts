import { Model } from 'sequelize';
declare class User extends Model {
    id: number;
    vatin: string;
    firstName: string;
    lastName: string;
}
export default User;
