import { PubSub } from "graphql-subscriptions";
import Note from "../models/Note";

export const resolvers = (pubsub: PubSub) => ({
  Query: {
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
    }
  },
  Subscription: {
    noteAdded: {
      subscribe: () => pubsub.asyncIterator(['noteAdded']),
    },
  },
});