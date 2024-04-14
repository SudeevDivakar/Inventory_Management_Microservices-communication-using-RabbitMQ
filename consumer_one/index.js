const amqp = require("amqplib");

async function consumeMessages() {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchangeName = "producerExchange";
  await channel.assertExchange(exchangeName, "direct");

  const q = await channel.assertQueue("health_check");
  await channel.bindQueue(q.queue, exchangeName, "health_check");

  channel.consume(q.queue, async (msg) => {
    const resQ = await channel.assertQueue("health_check_response");
    await channel.bindQueue(resQ.queue, exchangeName, "health_check_response");
    await channel.publish(
      exchangeName,
      "health_check_response",
      Buffer.from(JSON.stringify("healthy"))
    );
  });
}

consumeMessages();
