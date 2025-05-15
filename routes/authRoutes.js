const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser,refreshToken, resetPassword, requestPasswordReset } = require('../controllers/authController');
const { registerValidator, loginValidator, resetPasswordValidator, requestPasswordResetValidator } = require('../middlewares/validators/authValidator');
const  protect  = require('../middlewares/authMiddleware');

router.post('/register', registerValidator, registerUser);
router.post('/login', loginValidator, loginUser);
router.post('/request-password-reset', requestPasswordResetValidator, requestPasswordReset);
router.post('/reset-password', resetPasswordValidator, resetPassword);
router.post('/logout', logoutUser);
router.post('/refresh-token', refreshToken);
// Example protected route
router.get('/profile', protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;