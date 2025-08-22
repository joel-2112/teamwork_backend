import {
  createContactUsService,
  getContactUsByIdService,
  getAllContactUsService,
  deleteContactUsService,
} from "../services/contactUsService.js";

export const createContactUs = async (req, res) => {
  try {
    const contactUs = await createContactUsService(req.body);
    return res.status(201).json({
      success: true,
      message: "Contact Us created successfully",
      contactUs: contactUs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


export const getContactUsById = async (req, res) => {
  try {
    const contactUs = await getContactUsByIdService(req.params.id);
    if (!contactUs) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res
      .status(200)
      .json({
        success: true,
        message: "Contact Us retrieved successfully",
        contactUs: contactUs,
      });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllContactUs = async (req, res) => {
    try {
        const {page, limit, fullName, email, search} = req.query;
        const contactUs = await getAllContactUsService(page, limit, fullName, email, search);
        return res.status(200).json({
            success: true,
            message: "All Contact Us retrieved successfully",
            contactUs: contactUs,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteContactUs = async (req, res) => {
    try {
        const contactUs = await deleteContactUsService(req.user.id, req.params.id);
        return res.status(200).json({
            success: true,
            message: "Contact Us deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
