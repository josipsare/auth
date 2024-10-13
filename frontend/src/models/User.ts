import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

class User extends Model {
    public id!: number;
    public vatin!: string;
    public firstName!: string;
    public lastName!: string;
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        vatin: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Ensure unique constraint
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
    }
);

export default User;
