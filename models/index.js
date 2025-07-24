import { Sequelize, DataTypes } from "sequelize";
import db from "../config/database.js";

// Import models using ESM import syntax
import JobModel from "./Job.js";
import JobApplicationModel from "./JobApplication.js";
import UserModel from "./User.js";
import RefreshTokenModel from "./RefreshToken.js";
import AgentModel from "./Agent.js";
import RegionModel from "./Region.js";
import ZoneModel from "./Zone.js";
import WoredaModel from "./Woreda.js";
import NewsModel from "./News.js";
import EventModel from "./Event.js";
import PartnershipModel from "./Partnership.js";
import ServiceOrderModel from "./ServiceOrder.js";
import CustomerOrderModel from "./CustomerOrder.js";
import UserFeedbackModel from "./UserFeadback.js";
import AboutModel from "./About.js";
import ServiceModel from "./Service.js";
import RoleModel from "./role.js";
import ImageModel from "./images.js";
import ReportModel from "./Report.js";

// Initialize models by passing db and DataTypes
const Job = JobModel(db, DataTypes);
const JobApplication = JobApplicationModel(db, DataTypes);
const User = UserModel(db, DataTypes);
const RefreshToken = RefreshTokenModel(db, DataTypes);
const Agent = AgentModel(db, DataTypes);
const Region = RegionModel(db, DataTypes);
const Zone = ZoneModel(db, DataTypes);
const Woreda = WoredaModel(db, DataTypes);
const News = NewsModel(db, DataTypes);
const Event = EventModel(db, DataTypes);
const Partnership = PartnershipModel(db, DataTypes);
const ServiceOrder = ServiceOrderModel(db, DataTypes);
const CustomerOrder = CustomerOrderModel(db, DataTypes);
const UserFeedback = UserFeedbackModel(db, DataTypes);
const About = AboutModel(db, DataTypes);
const Service = ServiceModel(db, DataTypes);
const Role = RoleModel(db, DataTypes);
const Image = ImageModel(db, DataTypes);
const Report = ReportModel(db, DataTypes);

const models = {
  Event,
  Image,
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
  ServiceOrder,
  CustomerOrder,
  UserFeedback,
  About,
  Service,
  Role,
  Report,
};

// user and role relation
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

// Define associations
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

Zone.hasMany(Woreda, { foreignKey: "zoneId", as: "woredas" });
Woreda.belongsTo(Zone, { foreignKey: "zoneId", as: "zone" });

Agent.belongsTo(Region, {
  foreignKey: "regionId",
  as: "Region",
});
Agent.belongsTo(Zone, {
  foreignKey: "zoneId",
  as: "Zone",
});
Agent.belongsTo(Woreda, {
  foreignKey: "woredaId",
  as: "Woreda",
});

ServiceOrder.belongsTo(Region, {
  foreignKey: "regionId",
  as: "Region",
});
ServiceOrder.belongsTo(Zone, {
  foreignKey: "zoneId",
  as: "Zone",
});
ServiceOrder.belongsTo(Woreda, {
  foreignKey: "woredaId",
  as: "Woreda",
});

CustomerOrder.belongsTo(Region, {
  foreignKey: "regionId",
  as: "Region",
});
CustomerOrder.belongsTo(Zone, {
  foreignKey: "zoneId",
  as: "Zone",
});
CustomerOrder.belongsTo(Woreda, {
  foreignKey: "woredaId",
  as: "Woreda",
});
Report.belongsTo(Region, {
  foreignKey: "regionId",
  as: "Region",
});
Report.belongsTo(Zone, {
  foreignKey: "zoneId",
  as: "Zone",
});
Report.belongsTo(Woreda, {
  foreignKey: "woredaId",
  as: "Woreda",
});

User.hasMany(Report, {
  foreignKey: "userId",
});
Report.belongsTo(User, { foreignKey: "userId" });

Event.hasMany(Image, {
  foreignKey: "eventId",
  as: "images",
  onDelete: "CASCADE",
});
Image.belongsTo(Event, { foreignKey: "eventId" });
// Service.hasMany(Image, {
//   foreignKey: "serviceId",
//   as: "images",
//   onDelete: "CASCADE",
// });
// Image.belongsTo(Service, { foreignKey: "serviceId" });
User.hasMany(Agent, {
  foreignKey: "deletedBy",
});
Agent.belongsTo(User, {
  foreignKey: "deletedBy",
});

Service.hasMany(ServiceOrder, {
  foreignKey: "serviceId",
});
ServiceOrder.belongsTo(Service, { foreignKey: "serviceId" });

User.hasMany(CustomerOrder, {
  foreignKey: "userId",
});
CustomerOrder.belongsTo(User, { foreignKey: "userId" });

User.hasOne(Partnership, {
  foreignKey: "userId",
});
Partnership.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Partnership, {
  foreignKey: "deletedBy",
});
Partnership.belongsTo(User, {
  foreignKey: "deletedBy",
});

export default {
  sequelize: db,
  Sequelize,
  ...models,
};
