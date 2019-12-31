/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('posted_jobs', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      primaryKey: true
    },
    employer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    company: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pay: {
      type: DataTypes.REAL,
      allowNull: true
    },
    state: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    major: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'posted_jobs',
    timestamps: false
  });
};
