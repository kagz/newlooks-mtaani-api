const Order = require('./../models/orderModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
//alternative method to see if works
exports.addOrder = catchAsync(async (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  const { products } = req.body;
  const order = new Order();

  order.user = req.body.user;
  order.totalPrice = req.body.totalPrice;

  // eslint-disable-next-line array-callback-return
  await products.map(product => {
    order.products.push({
      product: product.product,
      quantity: product.quantity,
      cost: product.cost
    });
  });

  order.save();
  res.json({
    success: true,
    message: 'Successfully placed  an order'
  });
});

exports.getMyOrders = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  await Order.find({ user: req.body.user })
    .populate('products.product')
    .populate('owner')
    .exec((err, orders) => {
      if (err) {
        return next(new AppError('Could not find your order', 404));
      }
      res.json({
        results: orders.length,
        success: true,
        message: 'Found your order',
        orders: orders
      });
    });
});

exports.getAllOrders = factory.getAll(Order);
exports.getOrder = factory.getOne(Order);
exports.updateOrder = factory.updateOne(Order);
exports.deleteOrder = factory.deleteOne(Order);
