const amqp = require('amqplib');
const logger = require('./logger');
const { envConfig } = require('../config');

const { rabbitmqUrl } = envConfig;

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectToRabbitMQ() {
  try {
    // Create a connection
    const connection = await amqp.connect(rabbitmqUrl);
    // Create a channel
    channel = await connection.createChannel();
    // Create a fanout exchange
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', {
      durable: false,
    });

    logger.info('Connected to RabbitMQ Successfully');
    return channel;

  } catch (error) {
    logger.error('Error connecting to RabbitMQ', error);
  }
}

async function publishEvent(routingKey, message) {
  if (!channel) {
    await connectToRabbitMQ();
  }

  channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));
  logger.info(`Event Published: ${routingKey}`);
}

module.exports = { connectToRabbitMQ, publishEvent };
