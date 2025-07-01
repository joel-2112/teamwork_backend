import { where } from "sequelize";
import db from "../models/index.js";
const { Role } = db;

export const createRoleService = async (name) => {
  const existingRole = await Role.findOne({ where: { name } });
  if(existingRole){
    throw new Error("role already exist.");
  }

  const role = await Role.create({
    name,
  });

  return role;
};
