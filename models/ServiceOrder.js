// models/CustomerOrder.js
export default (db, DataTypes) => {
  const ServiceOrder = db.define(
    "ServiceOrder",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      orderTitle: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [3, 100],
        },
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      phoneNumber1: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          is: /^\+?[\d\s-]{10,}$/i,
        },
      },
      phoneNumber2: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          is: /^\+?[\d\s-]{10,}$/i,
        },
      },
      sex: {
        type: DataTypes.ENUM(["male", "female", "other"]),
        allowNull: false,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      regionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "regions",
          key: "id",
        },
      },
      zoneId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "zones",
          key: "id",
        },
      },
      woredaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "woredas",
          key: "id",
        },
      },
      manualRegion: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manualZone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manualWoreda: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sector: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      roleInSector: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      shortDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [10, 500],
        },
      },
      requirementFile: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "reviewed",
          "accepted",
          "rejected",
          "in_progress",
          "completed",
          "cancelled",
        ]),
        allowNull: false,
        defaultValue: "pending",
      },
      serviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "services",
          key: "id",
        },
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      deletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "users",
          key: "id",
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
    },
    {
      tableName: "service_orders",
      timestamps: true,
      indexes: [
        { fields: ["country"] },
        { fields: ["status"] },
        { fields: ["regionId"] },
        { fields: ["zoneId"] },
        { fields: ["woredaId"] },
      ],
    }
  );

  return ServiceOrder;
};
