const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/role/:id', userController.updateUserRole);
router.put('/:id', userController.updateUser);
router.post('/change-password', userController.changePassword);

module.exports = router;
