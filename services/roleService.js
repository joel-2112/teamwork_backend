import { where } from "sequelize";
import db from "../models/index.js";
const { Role } = db;

// Service to Create new role
export const createRoleService = async (name) => {
  const existingRole = await Role.findOne({ where: { name } });
  if (existingRole) {
    throw new Error("role already exist.");
  }

  const role = await Role.create({
    name,
  });

  return role;
};

// Service to Update Role by id
export const updateRoleByIdService = async (id, name) => {
  const existingRole = await Role.findByPk(id);

  if (!existingRole) {
    throw new Error("Role not found.");
  }

  existingRole.name = name;
  const updatedRole = await existingRole.save();

  return updatedRole;
};

// Retrieve all role
export const getRoleByIdService = async (id) => {
  try {
    const role = await Role.findByPk(id);
    if (!role) throw new Error("Role not found.");

    return role;
  } catch (error) {
    throw new Error("Failed to retrieve all role.", error.message);
  }
};

// Service to delete role by id
export const deleteRoleByIdService = async (id) => {
  try {
    const role = await Role.findByPk(id);

    if (!role) throw new Error("Role not found");
    const deletedRole = await role.destroy();

    return deletedRole;
  } catch (error) {
    throw new Error("Failed to delete role.");
  }
};
