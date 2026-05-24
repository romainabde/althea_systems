const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const paymentController = require('../controllers/paymentController');

// Route de mise à jour (PUT)
router.put('/profile', authMiddleware, userController.updateProfile);

// Route d'ajout d'adresse (POST)
router.post('/addresses', authMiddleware, userController.addAddress);

router.get('/payments', authMiddleware, paymentController.listPaymentMethods);
router.post('/payments', authMiddleware, paymentController.addPaymentMethod);
router.delete('/payments/:id', authMiddleware, paymentController.deletePaymentMethod);

module.exports = router;