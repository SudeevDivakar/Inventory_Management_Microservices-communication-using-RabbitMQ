const express = require("express");
const app = express();
const amqp = require("amqplib");

const Producer = require("./producer.js");
const producer = new Producer();

const PORT = 8080;

app.use(express.json());

app.put("/item", async (req, res) => {
  await producer.publishMessage(req.body.logType, req.body.message);
  res.send({ updated: true });
});

app.get("/health", async (req, res) => {
  await producer.publishMessage(req.body.logType, req.body.message);

  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "producerExchange";
  await channel.assertExchange(exchangeName, "direct");

  const resQ = await channel.assertQueue("health_check_response");
  await channel.bindQueue(resQ.queue, exchangeName, "health_check_response");

  const healthCheckArray = [];

  channel.consume(resQ.queue, async (msg) => {
    if (JSON.parse(msg.content) === "healthy") {
      healthCheckArray.push("Healthy");
    }
    console.log(healthCheckArray);

    if (healthCheckArray.length === 1) {
      res.status(200).send({ status: "Healthy" });
    }
    channel.ack(msg);
  });
});

app.get("/order", async (req, res) => {
  await producer.publishMessage(req.body.logType, req.body.message);

  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "producerExchange";
  await channel.assertExchange(exchangeName, "direct");

  const resQ = await channel.assertQueue("order_details");
  await channel.bindQueue(resQ.queue, exchangeName, "order_details");

  const orderDetailsArray = [];

  channel.consume(resQ.queue, (msg) => {
    const data = JSON.parse(msg.content);
    if (data.error) {
      throw new Error("Could Not Fetch Order Details");
    } else {
      orderDetailsArray.push(data.orderDetails);
    }
    console.log(orderDetailsArray);

    if (orderDetailsArray.length === 1) {
      res.send(orderDetailsArray[orderDetailsArray.length - 1]);
    }
    channel.ack(msg);
  });
});

app.put("/order", async (req, res) => {
  await producer.publishMessage(req.body.logType, req.body.message);
  res.send({ delivered: true });
});

app.post("/item/new", async (req, res) => {
  await producer.publishMessage(req.body.logType, req.body.message);
  res.send(req.body.message);
});

app.post("/order/new", async (req, res) => {
  await producer.publishMessage(req.body.logType, req.body.message);
  res.send(req.body.message);
});

app.listen(PORT, () => {
  console.log(`Server Started on Port ${PORT}`);
});
