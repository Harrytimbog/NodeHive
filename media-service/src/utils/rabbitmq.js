const amqp = require('amqplib');
const logger = require('./logger');
const { envConfig } = require('../config');

const { rabbitmqUrl } = envConfig;

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectToRabbitMQ(retries = 5) {
  while (retries) {
    try {
      // Create a connection
      connection = await amqp.connect(rabbitmqUrl); // Update global connection
      channel = await connection.createChannel(); // Update global channel

      // Create a fanout exchange
      await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: false });

      logger.info('Connected to RabbitMQ Successfully');
      return channel;
    } catch (error) {
      retries -= 1;
      logger.error(`Error connecting to RabbitMQ. Retrying in 5 seconds... (${retries} retries left)`, error);
      if (retries === 0) {
        throw new Error('Failed to connect to RabbitMQ after retries.');
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
    if (!channel) {
      await connectToRabbitMQ();
    }

    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);

    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          channel.ack(msg);
        } catch (error) {
          logger.error('Error processing message', error);
          channel.nack(msg, false, false);
        }
      }
    });

    logger.info(`Subscribed to Event: ${routingKey}`);
  } catch (error) {
    logger.error(`Error in consumeEvent: ${error.message}`, error);
    setTimeout(() => {
      consumeEvent(routingKey, callback).catch((retryError) =>
        logger.error(`Retry failed for consumeEvent: ${retryError.message}`, retryError)
      );
    }, 5000);
  }
}

module.exports = { connectToRabbitMQ, publishEvent, consumeEvent };
