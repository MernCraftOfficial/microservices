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
      enum: ['pending', 'accepted', 'blocked', 'member'],
      default: 'pending',
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
        ret._id = ret._id?.toString();
        ret.entityId = ret.entityId?.toString();
        // Remove internal fields
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
