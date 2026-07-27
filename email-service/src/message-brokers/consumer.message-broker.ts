// import amqp from 'amqplib';
// import env from '../config/env';

// export async function rabbitMqConsumer(queueName: string) {
//   try {
//     const connection = await amqp.connect(env?.RABBIT_MQ_URI);
//     console.log('connection created');
//     const channel = await connection.createChannel();
//     console.log('channel created');
//     await channel.assertQueue(queueName, { durable: false });
//     console.log('queue created if does not exist or used if already exist');

//     //eventlistener for CTRL + C
//     process.once('SIGINT', async () => {
//       await channel.close();
//       await connection.close();
//     });

//     await channel.consume(
//       queueName,
//       (message: any) => {
//         if (message) console.log('[x] Received: %s <-- %s', message, queueName);
//       },
//       { noAck: true },
//     );
//   } catch (error) {
//     console.warn(error);
//   }
// }
