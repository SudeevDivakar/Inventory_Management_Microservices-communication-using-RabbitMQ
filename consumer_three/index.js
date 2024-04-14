const amqp = require("amqplib");

const mongoose = require("mongoose");

const Item = require("./itemSchema.js");

mongoose
  .connect("mongodb://127.0.0.1:27017/CCProject")
  .then(() => {
    console.log("Database connection open");
  })
  .catch(() => {
    console.log("Error in Database Connection");
  });

async function updateInventory(data) {
  try {
    await Item.findByIdAndUpdate(data._id, data);
  } catch (err) {
    console.log("ERROR IN UPDATING INVENTORY", err);
    throw new Error("ERROR IN UPDATING INVENTORY");
  }
}

async function consumeMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "producerExchange";
  await channel.assertExchange(exchangeName, "direct");

  const q = await channel.assertQueue("consumer_three");
  await channel.bindQueue(q.queue, exchangeName, "consumer_three");

  channel.consume(q.queue, (msg) => {
    const data = JSON.parse(msg.content);
    updateInventory(data.message);
    channel.ack(msg);
  });
}

consumeMessages();
