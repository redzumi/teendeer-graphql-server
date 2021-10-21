import { Server } from '@hapi/hapi';
import * as mongoose from 'mongoose';
import { ApolloServer, ApolloServerPluginStopHapiServer, gql } from 'apollo-server-hapi';

import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { PubSub } from 'graphql-subscriptions';

import Note from '../models/Note';

const pubsub = new PubSub();
const mongoosePath = 'mongodb://localhost:27017/test-db';


const oldApolloServer = async () => {
  const server = new Server({
    port: 4000,
    host: 'localhost'
  });

  const resolvers = {
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
  };

  const typeDefs = gql`
  type Query {
    notes: [Note]
  }

  type Note {
    id: String
    title: String
    body: String
  }

  type Mutation {
    addNote(title: String!, body: String!): [Note]
  }

  type Subscription {
    noteAdded: Note
  }
`;

  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      {
        async serverWillStart() {
          return {
            async drainServer() {
              subscriptionServer.close();
            }
          };
        }
      },
      ApolloServerPluginStopHapiServer({ hapiServer: server }),
    ],
  });

  const subscriptionServer = SubscriptionServer.create({
    // This is the `schema` we just created.
    schema,
    // These are imported from `graphql`.
    execute,
    subscribe,
  }, {
    // This is the `httpServer` we created in a previous step.
    server: server.listener,
    // This `server` is the instance returned from `new ApolloServer`.
    path: apolloServer.graphqlPath,
  });

  server.route([
    {
      method: 'GET',
      path: '/',
      handler: async (requset, reply) => {
        return `<h1>Test route</h1>`
      }
    },
    // {
    //   method: 'GET',
    //   path: '/api/v1/paintings',
    //   handler: async (requset, reply) => {
    //     // return Painting.find();
    //     return `<h1>Test route</h1>`
    //   }
    // },
    // {
    //   method: 'POST',
    //   path: '/api/v1/paintings',
    //   handler: async (requset: PaintingPOSTRequest, reply) => {
    //     const { name, url, techniques } = requset.payload;
    //     const painting = new Painting({
    //       name,
    //       url,
    //       techniques
    //     });
    //     return painting.save();
    //   }
    // }
  ]);

  await apolloServer.start();
  await apolloServer.applyMiddleware({ cors: { origin: ['*'] }, app: server });
  await server.start();

  // await httpServer.listen(4000, () =>
  //   console.log(`Server is now running on http://localhost:4000/graphql`)
  // );

  console.log(`Server running at ${server.info.uri}`);
  db();
};

const db = () => {
  mongoose.connect(mongoosePath);
  mongoose.connection.once('open', () => {
    console.log(`Connected to DB`);
  });
};
