/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Reviews', {
    Book_ID: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Review_ID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    Text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Rating: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Name: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'Reviews'
  });
};
