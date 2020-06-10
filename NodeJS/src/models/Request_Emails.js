/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Request_Emails', {
    Request_ID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Email_address: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'Request_Emails'
  });
};
