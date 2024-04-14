const amqp = require("amqplib");

const mongoose = require("mongoose");

const Order = require("./orderSchema.js");

mongoose
  .connect("mongodb://127.0.0.1:27017/CCProject")
  .then(() => {
    console.log("Database connection open");
  })
  .catch(() => {
    console.log("Error in Database Connection");
  });

//Function to place an order
async function placeOrder(data) {
  try {
    await Order.create(data);
    console.log("Order Placed Successfully");
  } catch (err) {
    console.log("Error in Order Placement", err);
  }
}

//Function to get order details for a single order
async function getOrderDetails(id) {
  try {
    const orderDetails = await Order.findById(id);
    return { error: false, orderDetails };
  } catch (err) {
    return { error: true };
  }
}

async function setOrderDelivered(id) {
  try {
    const result = await Order.findByIdAndUpdate(
      id,
      { delivered: true },
      { new: true }
    );
    if (!result) {
      throw new Error("Order not found");
    }
    return { error: false, result };
  } catch (err) {
    console.log("Error in Order Updation", err);
    return { error: true };
  }
}

async function consumeMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "producerExchange";
  await channel.assertExchange(exchangeName, "direct");

  const q = await channel.assertQueue("consumer_four");
  await channel.bindQueue(q.queue, exchangeName, "consumer_four");

  channel.consume(q.queue, async (msg) => {
    const data = JSON.parse(msg.content);
    if (data.message.type === 1) {
      placeOrder(data.message.payload);
    } else if (data.message.type === 2) {
      const orderDetails = await getOrderDetails(data.message.id);
      const resQ = await channel.assertQueue("order_details");
      await channel.bindQueue(resQ.queue, exchangeName, "order_details");
      await channel.publish(
        "producerExchange",
        "order_details",
        Buffer.from(JSON.stringify(orderDetails))
      );
    } else if (data.message.type === 3) {
      const result = await setOrderDelivered(data.message.id);
    }
    channel.ack(msg);
  });
}

consumeMessages();
