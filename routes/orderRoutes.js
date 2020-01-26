const express = require('express');
const orderController = require('./../controllers/orderController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/me/orders', authController.protect, orderController.getMyOrders);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    orderController.getAllOrders
  )
  .post(
    authController.protect,
    authController.restrictTo('user'),
    orderController.addOrder
  );

router.use(authController.restrictTo('admin', 'user'));
router
  .route('/:id')
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;
