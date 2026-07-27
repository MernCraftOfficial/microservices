import { connect } from 'mongoose';
import env from './env.config';
import { UserRelations } from '../models/user-relations.model';
import { Message } from '../models/message.model';

let connection: boolean = false;
export async function connectToMongoDb() {
  const uri: string = env.MONGO_URI;
  if (!connection) {
    connection = true;
    try {
      await connect(uri, { socketTimeoutMS: 1000, autoIndex: false });
      await UserRelations.syncIndexes();
      await Message.syncIndexes();

      console.log('Indexes synced ✅');
      console.log('Connection established successfully');
    } catch (error) {
      console.error(error);
      return 1;
    }
  }
}
