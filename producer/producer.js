const amqp = require("amqplib");

class Producer {
  channel;

  async createChannel() {
    const connection = await amqp.connect("amqp://localhost");
    this.channel = await connection.createChannel();
  }

  async publishMessage(routingKey, message) {
    if (!this.channel) {
      await this.createChannel();
    }
    const exchangeName = "producerExchange";
    await this.channel.assertExchange(exchangeName, "direct");

    const logDetails = {
      logType: routingKey,
      message: message,
      dateTime: new Date(),
    };
    await this.channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(JSON.stringify(logDetails))
    );
  }
}

module.exports = Producer;
