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

async function createItem(data) {
  try {
    await Item.create(data);
    console.log("Item Created Successfully");
  } catch (err) {
    console.log("Error in Item Creation", err);
  }
}

async function consumeMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "producerExchange";
  await channel.assertExchange(exchangeName, "direct");

  const q = await channel.assertQueue("consumer_two");

  await channel.bindQueue(q.queue, exchangeName, "consumer_two");

  channel.consume(q.queue, (msg) => {
    const data = JSON.parse(msg.content);
    createItem(data.message);
    channel.ack(msg);
  });
}

consumeMessages();
