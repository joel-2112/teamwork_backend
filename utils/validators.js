import { body, validationResult } from 'express-validator';

export const validateJobData = (isUpdate = false) => {
    const validations = [
        body('title')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Title is required')
            .isString()
            .withMessage('Title must be a string')
            .trim()
            .isLength({ max: 100 })
            .withMessage('Title must not exceed 100 characters'),

        body('companyName')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Company name is required')
            .isString()
            .withMessage('Company name must be a string')
            .trim()
            .isLength({ max: 100 })
            .withMessage('Company name must not exceed 100 characters'),

        body('deadline')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Deadline is required')
            .isISO8601()
            .withMessage('Deadline must be a valid date')
            .custom((value) => new Date(value) > new Date())
            .withMessage('Deadline must be in the future'),

        body('description')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Description is required')
            .isString()
            .withMessage('Description must be a string')
            .trim(),

        body('location')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Location is required')
            .isString()
            .withMessage('Location must be a string')
            .trim()
            .isLength({ max: 100 })
            .withMessage('Location must not exceed 100 characters'),

        body('salary')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Salary is required')
            .isFloat({ min: 0 })
            .withMessage('Salary must be a positive number'),

        body('requirements')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Requirements are required')
            .isString()
            .withMessage('Requirements must be a string')
            .trim(),

        body('skills')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Skills are required')
            .isString()
            .withMessage('Skills must be a string')
            .trim(),

        body('jobType')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Job type is required')
            .isIn(['full-time', 'part-time', 'contract', 'remote', 'internship'])
            .withMessage('Invalid job type'),

        body('category')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Category is required')
            .isIn(['engineering', 'marketing', 'sales', 'design', 'hr'])
            .withMessage('Invalid category'),

        body('benefits')
            .optional()
            .isString()
            .withMessage('Benefits must be a string')
            .trim(),

        body('jobStatus')
            .optional()
            .isIn(['open', 'closed'])
            .withMessage('Invalid job status'),

        body('experience')
            .if(() => !isUpdate)
            .notEmpty()
            .withMessage('Experience is required')
            .isString()
            .withMessage('Experience must be a string')
            .trim(),
    ];

    return [
        ...validations,
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array().map(err => err.msg),
                });
            }
            next();
        },
    ];
};
