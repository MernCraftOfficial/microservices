import mongoose from 'mongoose';

const userRelationsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // speeds up lookups by userId
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // speeds up reverse lookups (which users belong to group?)
    },

    relationType: {
      type: String,
      enum: ['friend', 'group'],
      required: true,
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'blocked'],
      default: 'pending',
    },

    unreadMessages: {
      user: { type: String, default: null },
      count: { type: Number, default: 0 },
    },

    lastMessage: {
      user: { type: String, default: null },
      message: { type: String, default: 0 },
    },

    role: {
      type: String,
      enum: ['admin', 'member', 'owner', null],
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        // Convert ObjectIds to strings
        ret.entityId = ret.entityId?.toString();
        // Remove internal fields
        delete ret._id;
        delete ret.userId;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Prevent duplicates like (userId + entityId + relationType)
userRelationsSchema.index(
  { userId: 1, entityId: 1, relationType: 1 },
  { unique: true },
);

export const UserRelations = mongoose.model(
  'UserRelations',
  userRelationsSchema,
);
