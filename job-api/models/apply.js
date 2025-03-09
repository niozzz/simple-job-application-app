"use strict";
module.exports = (sequelize, DataTypes) => {
  const Apply = sequelize.define(
    "Apply",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Job",
          key: "id",
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      applicationDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "applies",
    }
  );

  Apply.associate = function (models) {
    // Define associations
    Apply.belongsTo(models.Job, { foreignKey: "jobId" });
    Apply.belongsTo(models.User, { foreignKey: "userId" });
  };

  return Apply;
};
