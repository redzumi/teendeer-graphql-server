import * as mongoose from 'mongoose';
import { execute, subscribe } from "graphql";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { Server } from '@hapi/hapi';
import { ApolloServer } from 'apollo-server-hapi';
import { PubSub } from 'graphql-subscriptions';
import { applyMiddleware } from 'graphql-middleware'
import { and, shield } from 'graphql-shield';

import { userSchema } from '../schemas/User';
import noteSchema from '../schemas/Note';
import { resolvers } from "../graphql/resolvers";
import { typeDefs } from "../graphql/typeDefs";

import { applyAuthorizationContext } from './utils';
import { roles } from './roles';

const MONGOOSE_PATH = 'mongodb://localhost:27017/test-db';

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

  // TODO: move in another file
  const permissions = shield({
    Query: {
      me: roles.isAuthenticated,
      noteMany: roles.isAuthenticated,
      userMany: roles.isAuthenticated,
    },
    Mutation: {
      noteCreateOne: and(roles.isAuthenticated),
      noteUpdateById: and(roles.isAuthenticated, roles.isNoteOwner),
    },
    Note: roles.isAuthenticated,
    User: roles.isAuthenticated,
  })

  const mergedSchema = mergeSchemas({ schemas: [defaultSchema, userSchema, noteSchema] });
  const graphQlSchema = applyMiddleware(mergedSchema, permissions)

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
    }],
    // TODO: move into utils?
    context: ({ request }) => {
      if (request?.headers['authorization'])
        return applyAuthorizationContext(request?.headers['authorization']);
      // If we use this throw – studio wont refresh scheme?
      // throw new Error('Missing auth token!');
    }
  });

  // TODO: should be custom context handler or auth?
  const subscriptionServer = SubscriptionServer.create(
    {
      schema: graphQlSchema,
      execute,
      subscribe,
      // TODO: move into utils?
      onConnect: async (connectionParams) => {
        if (connectionParams.authToken)
          return applyAuthorizationContext(connectionParams.authToken);
        // But here it dosent mean?
        // throw new Error('Missing auth token!');
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
