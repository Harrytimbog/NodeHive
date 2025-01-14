const amqp = require('amqplib');
const logger = require('./logger');

let connection = null;
let channel = null;

const EXCHANGE_NAME = 'facebook_events';

async function connectToRabbitMQ() {
  try {
    // Create a connection
    connection = await amqp.connect(process.env.RABBITMQ_URL);
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

module.exports = { connectToRabbitMQ }
