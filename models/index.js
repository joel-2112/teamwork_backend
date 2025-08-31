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
import MessageModel from "./Message.js";
import ContactUsModel from "./ContactUs.js";
import TeamModel from "./Team.js";

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
const Message = MessageModel(db, DataTypes);
const ContactUs = ContactUsModel(db, DataTypes);
const Team = TeamModel(db, DataTypes);

const models = {
  Event,
  Image,
  News,
  ContactUs,
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
  Message,
  Team,
};

// user and role relation
Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

// Define associations
Job.hasMany(JobApplication, {
  as: "applications",
  foreignKey: "jobId",
  onDelete: "CASCADE",
});
JobApplication.belongsTo(Job, { foreignKey: "jobId", as: "Job" });

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
  foreignKey: "createdBy",
});
Report.belongsTo(User, { foreignKey: "createdBy", as: "reportedBy" });

Event.hasMany(Image, {
  foreignKey: "eventId",
  as: "images",
  onDelete: "CASCADE",
});
Image.belongsTo(Event, { foreignKey: "eventId" });

// 2. Agent deleted by a User
User.hasMany(Agent, { foreignKey: "deletedBy", as: "DeletedAgents" });
Agent.belongsTo(User, { foreignKey: "deletedBy", as: "DeletedByUser" });

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
  as: "partnership",
});

Partnership.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Partnership, {
  foreignKey: "deletedBy",
});
Partnership.belongsTo(User, {
  foreignKey: "deletedBy",
});

User.hasMany(Report, { foreignKey: "deletedBy" });
Report.belongsTo(User, { foreignKey: "deletedBy", as: "removedBy" });

User.hasMany(Report, { foreignKey: "statusChangedBy" });
Report.belongsTo(User, {
  foreignKey: "statusChangedBy",
  as: "statusUpdatedBy",
});

User.hasMany(Job, { foreignKey: "postedBy" });
Job.belongsTo(User, { foreignKey: "postedBy" });

User.hasMany(Job, { foreignKey: "deletedBy" });
Job.belongsTo(User, { foreignKey: "deletedBy" });

User.hasMany(About, { foreignKey: "postedBy" });
About.belongsTo(User, { foreignKey: "postedBy" });

User.hasMany(About, { foreignKey: "deletedBy" });
About.belongsTo(User, { foreignKey: "deletedBy" });

User.hasMany(Event, { foreignKey: "postedBy" });
Event.belongsTo(User, { foreignKey: "postedBy" });

User.hasMany(Event, { foreignKey: "deletedBy" });
Event.belongsTo(User, { foreignKey: "deletedBy" });

User.hasMany(News, { foreignKey: "postedBy" });
News.belongsTo(User, { foreignKey: "postedBy" });

User.hasMany(News, { foreignKey: "deletedBy" });
News.belongsTo(User, { foreignKey: "deletedBy" });

User.hasOne(Agent, { foreignKey: "userId", as: "agents" });
Agent.belongsTo(User, { foreignKey: "userId", as: "users" });

User.hasMany(JobApplication, { foreignKey: "userId" });
JobApplication.belongsTo(User, { foreignKey: "userId" });

User.belongsTo(Region, { foreignKey: "regionId" });

User.belongsTo(Zone, { foreignKey: "zoneId" });

User.belongsTo(Woreda, { foreignKey: "woredaId" });

User.hasMany(Message, { foreignKey: "senderId", as: "sentMessages" });
User.hasMany(Message, { foreignKey: "receiverId", as: "receivedMessages" });

Message.belongsTo(User, { as: "Sender", foreignKey: "senderId" });
Message.belongsTo(User, { as: "Receiver", foreignKey: "receiverId" });

User.hasMany(ContactUs, { foreignKey: "deletedBy", as: "deletedContacts" });
ContactUs.belongsTo(User, { foreignKey: "deletedBy", as: "deletedByUser" });

export default {
  sequelize: db,
  Sequelize,
  ...models,
};
