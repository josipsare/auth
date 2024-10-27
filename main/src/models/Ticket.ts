import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../database';

class Ticket extends Model {
    public id!: string;
    public vatin!: string;
    public firstName!: string;
    public lastName!: string;
    public createdAt!: Date;
    public updatedAt!: Date;
}

Ticket.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        vatin: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Ticket',
        tableName: 'tickets',
    }
);

export default Ticket;
