import { createRoleService } from "../services/roleService.js";

export const createRoleController = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await createRoleService(name);
    res.status(200).json({ success: true, data: role });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
