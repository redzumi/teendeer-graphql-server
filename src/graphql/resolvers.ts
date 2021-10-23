import { PubSub } from "graphql-subscriptions";

export const resolvers = (pubsub: PubSub) => ({
  Query: {
    me: (parent, args, context) => context.user,
    serverTime: () => new Date().toDateString()
  },
  // TODO: add pubsub to compose
  // pubsub.publish('noteAdded', { noteAdded: note });
  Subscription: {
    noteAdded: {
      subscribe: () => pubsub.asyncIterator(['noteAdded']),
    },
  },
});