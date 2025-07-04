import {
  createRoleService,
  updateRoleByIdService,
  getRoleByIdService,
  deleteRoleByIdService,
} from "../services/roleService.js";

// Create new role
export const createRoleController = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await createRoleService(name);
    res.status(200).json({
      success: true,
      message: "Role created successfully.",
      role: role,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update role by id
export const updateRoleById = async (req, res) => {
  try {
    const { name } = req.body;
    const updatedRole = await updateRoleByIdService(req.params.id, name);

    res.status(200).json({
      success: true,
      message: "Role updated successfully.",
      role: updatedRole,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Retrieve role by id
export const getRoleById = async (req, res) => {
  try {
    const role = await getRoleByIdService(req.params.id);

    res.status(200).json({
      success: true,
      message: "Role retrieved successfully.",
      role: role,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

//Delete role
export const deleteRoleById = async (req, res) => {
  try {
    const role = await deleteRoleByIdService(req.params.id);

    res
      .status(200)
      .json({ success: true, message: "Role deleted successfully." });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};
