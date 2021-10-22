import * as mongoose from 'mongoose';
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { Server } from '@hapi/hapi';
import { ApolloServer, AuthenticationError } from 'apollo-server-hapi';
import { PubSub } from 'graphql-subscriptions';
import { verify } from 'jsonwebtoken';

import { UserModel, userSchema } from '../schemas/User';
import { resolvers } from "../graphql/resolvers";
import { typeDefs } from "../graphql/typeDefs";
import { Types } from 'mongoose';

const MONGOOSE_PATH = 'mongodb://localhost:27017/test-db';
const JWT_SECRET_KEY = 'secret';

export const apolloServer = async () => {
  const pubsub = new PubSub();

  const app = new Server({
    port: 4000,
    host: 'localhost'
  });

  app.route({
    method: 'GET',
    path: '/',
    handler: async (request, reply) => {
      return `powered by Hapi server`;
    }
  });

  const defaultSchema = makeExecutableSchema({
    typeDefs,
    resolvers: resolvers(pubsub)
  });

  const graphQlSchema = mergeSchemas({ schemas: [defaultSchema, userSchema] },);

  const apolloServer = new ApolloServer({
    schema: graphQlSchema,
    plugins: [{
      async serverWillStart() {
        return {
          async drainServer() {
            subscriptionServer.close();
          }
        };
      }
    }]
  });

  // TODO: should be custom context handler or auth?
  const subscriptionServer = SubscriptionServer.create(
    {
      schema: graphQlSchema,
      execute,
      subscribe,
      // TODO: move into utils?
      onConnect: async (connectionParams, webSocket) => {
        if (connectionParams.authToken) {
          const payload = <{ sub: string }>verify(connectionParams.authToken, JWT_SECRET_KEY);
          const filter = { _id: new Types.ObjectId(payload?.sub) };
          const user = await UserModel.findOne(filter);

          console.log(`User: ${user.firstName}`);

          if (user) return {
            currentUser: user,
          }

          throw new AuthenticationError('Invalid user');
        }

        throw new Error('Missing auth token!');
      }
    },
    { server: app.listener, path: apolloServer.graphqlPath, }
  );

  await apolloServer.start();
  await apolloServer.applyMiddleware({ cors: { origin: ['*'], credentials: true }, app: app });
  await app.start();

  db();
};

const db = () => {
  mongoose.connect(MONGOOSE_PATH);
  mongoose.connection.once('open', () => {
    console.log(`Connected to DB`);
  });
};
