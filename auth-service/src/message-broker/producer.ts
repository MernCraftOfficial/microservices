// import amqp from 'amqplib';
// import env from '../config/env';

// export async function rabbitMqProducer(queueName: string, message: any) {
//   let connection = null;
//   try {
//     connection = await amqp.connect(env?.RABBIT_MQ_URI);
//     console.log('connection created');
//     const channel = await connection.createChannel();
//     console.log('channel created');
//     await channel.assertQueue(queueName, { durable: false });
//     console.log('queue created');
//     channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
//     console.log('[x] Sent:  %s --> %s', message, queueName);
//     await channel.close();
//   } catch (error) {
//     console.warn(error);
//   } finally {
//     if (connection) await connection.close();
//   }
// }
