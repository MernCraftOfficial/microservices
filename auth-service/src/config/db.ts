import { connect } from 'mongoose';
import env from './env';

let connection: boolean = false;
export async function connectToMongoDb() {
  const uri: string = env.MONGO_URI;
  if (!connection) {
    connection = true;
    try {
      await connect(uri, { socketTimeoutMS: 1000, autoIndex: false });
    } catch (error) {
      console.error(error);
      return 1;
    } finally {
      console.log('Connection established successfully');
    }
  }
}
