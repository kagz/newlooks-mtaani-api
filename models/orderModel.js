const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    totalPrice: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },

    products: [
      {
        product: { type: mongoose.Schema.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        cost: { type: Number, default: 1 }
      }
    ],
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user'],
      unique: false
    },
    paid: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
orderSchema.pre(/^find/, function(next) {
  this.populate('user').populate({
    path: 'products.product',
    select: 'name'
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
