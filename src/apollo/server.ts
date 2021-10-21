import * as mongoose from 'mongoose';
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { Server } from '@hapi/hapi';
import { ApolloServer, ApolloServerPluginStopHapiServer, gql } from 'apollo-server-hapi';
import { PubSub } from 'graphql-subscriptions';

import { resolvers } from "../graphql/resolvers";
import { typeDefs } from "../graphql/typeDefs";

const mongoosePath = 'mongodb://localhost:27017/test-db';

export const apolloServer = async () => {
  const pubsub = new PubSub();

  const app = new Server({
    port: 4000,
    host: 'localhost'
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers: resolvers(pubsub)
  });

  const apolloServer = new ApolloServer({
    schema,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        };
      }
    }],
  });

  const subscriptionServer = SubscriptionServer.create(
    { schema, execute, subscribe },
    { server: app.listener, path: apolloServer.graphqlPath }
  );

  await apolloServer.start();
  await apolloServer.applyMiddleware({ cors: { origin: ['*'] }, app: app });
  await app.start();

  db();
};

const db = () => {
  mongoose.connect(mongoosePath);
  mongoose.connection.once('open', () => {
    console.log(`Connected to DB`);
  });
};
