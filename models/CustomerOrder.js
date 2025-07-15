// models/CustomerOrder.js
export default (db, DataTypes) => {
  const CustomerOrder = db.define(
    "CustomerOrder",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
        validate: {
          notEmpty: {
            msg: "Manual region is required for non-Ethiopian customers",
            when: (order) => order.country !== "Ethiopia" && !order.regionId,
          },
        },
      },
      manualZone: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "Manual zone is required for non-Ethiopian customers",
            when: (order) => order.country !== "Ethiopia" && !order.zoneId,
          },
        },
      },
      manualWoreda: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          notEmpty: {
            msg: "Manual woreda/city is required for non-Ethiopian customers",
            when: (order) => order.country !== "Ethiopia" && !order.woredaId,
          },
        },
      },
      sector: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
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
      sex: {
        type: DataTypes.ENUM(["male", "female", "other"]),
        allowNull: false,
      },
      roleInSector: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
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
        validate: {
          isUrl: true,
        },
      },
      status: {
        type: DataTypes.ENUM([
          "pending",
          "in_progress",
          "completed",
          "cancelled",
        ]),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "customer_orders",
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

  return CustomerOrder;
};
