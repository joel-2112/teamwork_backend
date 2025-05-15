const { body } = require('express-validator');

const registerValidator = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Password must contain at least one special character'),
];

const loginValidator = [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
];

const requestPasswordResetValidator = [
    body('email').isEmail().withMessage('Invalid email format'),
];

const resetPasswordValidator = [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/)
        .withMessage('Password must contain at least one special character'),
];

const jobDataValidator = (isUpdate = false) => [
    body('title')
        .if(() => !isUpdate)
        .trim()
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ max: 100 })
        .withMessage('Title must not exceed 100 characters'),
    body('companyName')
        .if(() => !isUpdate)
        .trim()
        .notEmpty()
        .withMessage('Company name is required')
        .isLength({ max: 100 })
        .withMessage('Company name must not exceed 100 characters'),
];
const agentDataValidator = (isUpdate = false) => [
    body('name')
        .if(() => !isUpdate)
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 100 })
        .withMessage('Name must not exceed 100 characters'),
    body('email')
        .if(() => !isUpdate)
        .isEmail()
        .normalizeEmail()
        .withMessage('Invalid email format'),
    body('phone')
        .if(() => !isUpdate)
        .trim()
        .notEmpty()
        .withMessage('Phone is required')
        .isLength({ max: 20 })
        .withMessage('Phone must not exceed 20 characters'),
];
module.exports = {
    agentDataValidator,
    registerValidator,
    loginValidator,
    requestPasswordResetValidator,
    resetPasswordValidator,
    jobDataValidator,
};