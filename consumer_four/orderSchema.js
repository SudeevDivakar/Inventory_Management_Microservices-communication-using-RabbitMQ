const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const getDeliveryDate = () => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  return deliveryDate;
};

const orderSchema = new Schema({
  items: [
    {
      type: Schema.Types.ObjectId,
      ref: "Item",
    },
  ],
  customer_id: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
  },
  total_amount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveryDate: {
    type: Date,
    default: getDeliveryDate,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Order", orderSchema);
