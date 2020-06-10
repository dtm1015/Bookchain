import Sequelize from 'sequelize';

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PWD,
  {
    dialect: 'postgres',
  },
);

const models = {
    book: sequelize.import('./Books'),
    requests: sequelize.import('./Requests'),
    reviews: sequelize.import('./Reviews'),
    request_Emails: sequelize.import('./Request_Emails'),
};


export { sequelize };
export default models;
