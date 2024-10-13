import User from './User';
import Ticket from './Ticket';

// Set up associations
User.hasMany(Ticket, { foreignKey: 'vatin', sourceKey: 'vatin' });
Ticket.belongsTo(User, { foreignKey: 'vatin', targetKey: 'vatin' });

// Export all models
export { User, Ticket };