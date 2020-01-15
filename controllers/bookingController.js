const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require('../models/productModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked product
  const product = await Product.findById(req.params.productId);
  // console.log(product);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get('host')}/my-products/?product=${
    //   req.params.productId
    // }&user=${req.user.id}&price=${product.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-products?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/product/${product.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.productId,
    line_items: [
      {
        name: `${product.name} Product`,
        description: product.summary,
        images: [
          `${req.protocol}://${req.get('host')}/img/products/${product.imageCover}`
        ],
        amount: product.price * 100,
        currency: 'usd',
        quantity: 1
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

const createBookingCheckout = async session => {
  const product = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.display_items[0].amount / 100;
  await Booking.create({ product, user, price });
};

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true });
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);

// router.post('/payment', checkJWT, (req, res, next) => {
//   const stripeToken = req.body.stripeToken;
//   const currentCharges = Math.round(req.body.totalPrice * 100);

//   stripe.customers
//     .create({
//       source: stripeToken.id
//     })
//     .then(function(customer) {
//       return stripe.charges.create({
//         amount: currentCharges,
//         currency: 'usd',
//         customer: customer.id
//       });
//     })
//     .then(function(charge) {
//       const products = req.body.products;

//       let order = new Order();
//       order.owner = req.decoded.user._id;
//       order.totalPrice = currentCharges;

//       products.map(product => {
//         order.products.push({
//           product: product.product,
//           quantity: product.quantity
//         });
//       });

//       order.save();
//       res.json({
//         success: true,
//         message: "Successfully made a payment"
//       });
//     });
// });

//lipa na mpesa
