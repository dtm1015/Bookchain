/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Requests', {
    Request_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true, 
      allowNull: true
    },
    Book_ID: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    Investment: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'Requests'
  });
};
