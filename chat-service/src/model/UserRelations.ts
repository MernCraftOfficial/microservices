import mongoose from 'mongoose';

const userRelationsSchema = new mongoose.Schema(
  {
    participantA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // speeds up lookups by participantA
    },

    participantB: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // speeds up reverse lookups (which users belong to group?)
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
      participantA: { type: Number, default: 0 },
      participantB: { type: Number, default: 0 },
    },

    lastMessage: {
      participantA: { type: String, default: null },
      participantB: { type: String, default: null },
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
        ret.participantB = ret.participantB?.toString();
        ret._id = ret._id?.toString();
        ret.participantA = ret.participantA?.toString();
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Prevent duplicates like (participantA + participantB + relationType)
userRelationsSchema.index(
  { participantA: 1, participantB: 1, relationType: 1 },
  { unique: true },
);

export const UserRelations = mongoose.model(
  'UserRelations',
  userRelationsSchema,
);
