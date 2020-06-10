/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Books', {
    ISBN: {
      type: DataTypes.TEXT,
      allowNull: false,
      primaryKey: true
    },
    Title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Authors: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Thumbnail_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Info_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Cover_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Publish_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    Num_pages: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ID_json: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    Description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'Books',
    timestamps: false
  });
};
