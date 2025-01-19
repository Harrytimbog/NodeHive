const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectToRabbitMQ(retries = 5) {
  while (retries) {
    try {
      // Create a connection
      const connection = await amqp.connect(process.env.RABBITMQ_URL);

      // Create a channel
      const channel = await connection.createChannel();
      // Create a fanout exchange
      await channel.assertExchange(EXCHANGE_NAME, 'fanout', {
        durable: false,
      });

      logger.info('Connected to RabbitMQ Successfully');
      return channel; // Return the created channel
    } catch (error) {
      retries -= 1;
      logger.error(`Error connecting to RabbitMQ. Retrying in 5 seconds... (${retries} retries left)`, error);
      if (retries === 0) {
        throw new Error("Failed to connect to RabbitMQ after retries.");
      }
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5 seconds before retrying
    }
  }
}


async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
  logger.info(`Event Published: ${routingKey}`);
}

async function consumeEvent(routingKey, callback) {
  try {
    // Ensure the channel is connected
    if (!channel) {
      await connectToRabbitMQ();
    }

    // Create a temporary, exclusive queue
    const q = await channel.assertQueue('', { exclusive: true });

    // Bind the queue to the exchange with the specified routing key
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    // Start consuming messages
    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString()); // Parse the message content
          callback(content); // Pass the message content to the provided callback
          channel.ack(msg); // Acknowledge the message
        } catch (error) {
          logger.error('Error processing message', error);
          channel.nack(msg, false, false); // Negative acknowledgment
        }
      }
    });

    logger.info(`Subscribed to Event: ${routingKey}`);
  } catch (error) {
    logger.error(`Error in consumeEvent: ${error.message}`, error);

    // Retry logic in case of failure
    setTimeout(() => {
      consumeEvent(routingKey, callback).catch((retryError) =>
        logger.error(`Retry failed for consumeEvent: ${retryError.message}`, retryError)
      );
    }, 5000); // Retry after 5 seconds
  }
}

module.exports = { connectToRabbitMQ, publishEvent, consumeEvent };
