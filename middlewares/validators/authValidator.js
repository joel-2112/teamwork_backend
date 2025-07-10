import { body } from "express-validator";
import { param } from "express-validator";
import moment from "moment";

// User data validator
export const createUserValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email format")
    .custom((email) => {
      const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
      const domain = email.split("@")[1]?.toLowerCase();

      if (!allowedDomains.includes(domain)) {
        throw new Error(`Only ${allowedDomains.join(", ")} emails are allowed`);
      }

      return true;
    }),

  body("password")
    .isLength({ min: 4 })
    .withMessage("Password must be at least 4 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];

// Validator to validate role data when create role
export const createRoleValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Role name is required")
    .isString()
    .withMessage("Role name must be a string")
    .isLength({ min: 2, max: 50 })
    .withMessage("Role name must be between 2 and 50 characters"),
];

// Validate log in detail
export const loginValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email format")
    .custom((email) => {
      const allowedDomains = ["gmail.com", "yahoo.com", "outlook.com"];
      const domain = email.split("@")[1]?.toLowerCase();

      if (!allowedDomains.includes(domain)) {
        throw new Error(`Only ${allowedDomains.join(", ")} emails are allowed`);
      }

      return true;
    }),
  body("password").notEmpty().withMessage("Password is required"),
];

// validator to validate password reset data
export const requestPasswordResetValidator = [
  body("email").isEmail().withMessage("Invalid email format"),
];

// Validate the id in parameter
export const validateParamId = [
  param("id")
    .trim()
    .notEmpty()
    .withMessage("ID parameter is required")
    .isInt({ min: 1 })
    .withMessage("ID must be a valid positive integer"),
];

// validator to validate reset password
export const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*]/)
    .withMessage("Password must contain at least one special character"),
];

// News data validator
export const createNewsValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 5, max: 300 })
    .withMessage("Title must be between 5 and 300 characters"),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .isLength({ min: 10 })
    .withMessage("Content must be at least 10 characters long"),

  body("publishDate")
    .optional()
    .isISO8601()
    .withMessage("Publish date must be a valid ISO8601 date"),
];

// Job data validator
export const jobDataValidator = (isUpdate = false) => [
  body("title")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must not exceed 100 characters"),
  body("companyName")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Company name is required")
    .isLength({ max: 100 })
    .withMessage("Company name must not exceed 100 characters"),
  body("deadline")
    .if(() => !isUpdate)
    .isISO8601()
    .withMessage("Deadline must be a valid ISO8601 date")
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error("Deadline must be in the future");
      }
      return true;
    }),
  body("description")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("location")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Location is required")
    .isLength({ max: 100 })
    .withMessage("Location must not exceed 100 characters"),
  body("salary")
    .if(() => !isUpdate)
    .isFloat({ min: 0 })
    .withMessage("Salary must be a positive number"),
  body("requirements")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Requirements are required"),
  body("skills")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Skills are required"),
  body("jobType")
    .if(() => !isUpdate)
    .isIn(["full-time", "part-time", "contract", "remote", "internship"])
    .withMessage("Invalid job type"),
  body("category")
    .if(() => !isUpdate)
    .isIn(["engineering", "marketing", "sales", "design", "hr"])
    .withMessage("Invalid category"),
  body("benefits").optional().trim(),
  body("jobStatus")
    .optional()
    .isIn(["open", "closed"])
    .withMessage("Invalid job status"),
  body("experience")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Experience is required"),
];

// Event data validator
export const createEventValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required.")
    .isLength({ max: 255 })
    .withMessage("Title must be less than 255 characters."),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required.")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters."),

  body("location")
    .trim()
    .notEmpty()
    .withMessage("Location is required.")
    .isLength({ max: 255 })
    .withMessage("Location must be less than 255 characters."),

  body("eventDate")
    .notEmpty()
    .withMessage("Event date is required.")
    .custom((value) => {
      if (!moment(value, moment.ISO_8601, true).isValid()) {
        throw new Error("Invalid event date format. Use ISO 8601 format.");
      }
      // Allow today or any future date
      if (moment(value).isBefore(moment().startOf("day"))) {
        throw new Error("Event date cannot be in the past.");
      }
      return true;
    }),
];

// Agent data validator
export const agentDataValidator = (isUpdate = false) => [
  body("name")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must not exceed 100 characters"),
  body("email")
    .if(() => !isUpdate)
    .isEmail()
    .normalizeEmail()
    .withMessage("Invalid email format"),
  body("phone")
    .if(() => !isUpdate)
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({ max: 20 })
    .withMessage("Phone must not exceed 20 characters"),
];
