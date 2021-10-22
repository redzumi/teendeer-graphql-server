import { PubSub } from "graphql-subscriptions";
import Note from "../models/Note";

export const resolvers = (pubsub: PubSub) => ({
  Query: {
    me: (parent, args, context) => context.user,
    serverTime: () => new Date().toDateString(),
    notes: async (parent, args) => {
      return await Note.find();
    }
  },
  Mutation: {
    addNote: async (parent, args) => {
      const { title, body } = args;
      const note = new Note({
        title,
        body
      });

      pubsub.publish('noteAdded', {
        noteAdded: note
      });

      await note.save();
      return await Note.find();
    },
    editNote: async (parent, args) => {
      const { id, title, body } = args;
      const filter = { id };
      const update = { title, body };

      await Note.findOneAndUpdate(filter, update);

      return await Note.find();
    }
  },
  Subscription: {
    noteAdded: {
      subscribe: () => pubsub.asyncIterator(['noteAdded']),
    },
  },
});