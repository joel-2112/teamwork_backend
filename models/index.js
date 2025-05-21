const { Sequelize, DataTypes } = require("sequelize");
const db = require("../config/database");

const Job = require("./Job")(db, DataTypes);
const JobApplication = require("./JobApplication")(db, DataTypes);
const User = require("./User")(db, DataTypes);
const RefreshToken = require("./RefreshToken")(db, DataTypes);
const Agent = require("./Agent")(db, DataTypes);
const Region = require("./Region")(db, DataTypes);
const Zone = require("./Zone")(db, DataTypes);
const Woreda = require("./Woreda")(db, DataTypes);
const News = require("./News")(db, DataTypes);
const Event = require("./Event")(db, DataTypes);
const Partnership = require("./Partnership")(db, DataTypes);
const CustomerOrder = require("./CustomerOrder")(db, DataTypes);
const models = {
  Event,
  News,
  Agent,
  Woreda,
  Region,
  Zone,
  Job,
  JobApplication,
  User,
  RefreshToken,
  Partnership,
  CustomerOrder,
};

Job.hasMany(JobApplication, {
  as: "JobApplications",
  foreignKey: "jobId",
  onDelete: "CASCADE",
});
JobApplication.belongsTo(Job, { foreignKey: "jobId" });

User.hasMany(RefreshToken, {
  foreignKey: "userId",
  as: "RefreshTokens",
  onDelete: "CASCADE",
});
RefreshToken.belongsTo(User, { foreignKey: "userId", as: "User" });

Zone.belongsTo(Region, { foreignKey: "regionId" });
Region.hasMany(Zone, { foreignKey: "regionId" });

Woreda.belongsTo(Zone, { foreignKey: "zoneId" });
Zone.hasMany(Woreda, { foreignKey: "zoneId" });

Agent.belongsTo(Woreda, { foreignKey: "woredaId" });
Woreda.hasMany(Agent, { foreignKey: "woredaId" });

CustomerOrder.belongsTo(db.models.Region, {
  foreignKey: "regionId",
  as: "Region",
});
CustomerOrder.belongsTo(db.models.Zone, { foreignKey: "zoneId", as: "Zone" });
CustomerOrder.belongsTo(db.models.Woreda, {
  foreignKey: "woredaId",
  as: "Woreda",
});

module.exports = {
  db,
  Sequelize,
  ...models,
};
