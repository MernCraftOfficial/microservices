import { Schema, model } from 'mongoose';
export type MessageType = 'text' | 'image' | 'video' | 'file' | 'audio';
export type MessageStatus = 'pending' | 'sent' | 'received' | 'read';
export interface Message extends Document {
  _id: string;
  content: string;
  sender: string;
  receiver: string;
  messageStatus: MessageStatus;
  messageType: MessageType;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}

const MessageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    messageStatus: {
      type: String,
      enum: ['sent', 'received', 'read'],
      default: 'sent',
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'video', 'file', 'audio'],
      default: 'text',
    },
    receivedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        // Convert ObjectIds to strings
        ret._id = ret._id?.toString();
        ret.sender = ret.sender?.toString();
        ret.receiver = ret.receiver?.toString();

        // Remove internal fields
        delete ret.__v;

        return ret;
      },
    },
  },
);
export const Message = model('Message', MessageSchema);
