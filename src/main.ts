import { Server } from '@hapi/hapi';
import * as mongoose from 'mongoose';
import { ApolloServer, ApolloServerPluginStopHapiServer, gql } from 'apollo-server-hapi';

import graphQLSchema from './graphql/schema';
import Painting from './models/Painting';
import Note from './models/Note';
import PaintingType from './graphql/PaintingType';

type PaintingPOSTRequest = {
  payload: {
    name: string;
    url: string;
    techniques: string[];
  }
}

const mongoosePath = 'mongodb://localhost:27017/test-db';

const server = new Server({
  port: 4000,
  host: 'localhost',
});

const books = [
  {
    title: 'The Awakening',
    author: 'Kate Chopin',
  },
  {
    title: 'City of Glass',
    author: 'Paul Auster',
  },
];

const resolvers = {
  Query: {
    books: () => books,
    paintings: async (parent, args) => {
      return await Painting.find();
    }
  },
  Mutation: {
    addPainting: async (parent, args) => {
      const { name, url, techniques } = args;
      const painting = new Painting({
        name,
        url,
        techniques
      });

      await painting.save();
      return await Painting.find();
    },
    addNote: async (parent, args) => {
      const { title, body } = args;
      const note = new Note({
        title,
        body
      });

      await note.save();
      return await Note.find();
    }
  }
};

const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
    paintings: [Painting]
    notes: [Note]
  }

  type Painting {
    id: String
    name: String
    url: String
    techniques: String
  }

  type Note {
    id: String
    title: String
    body: String
  }

  type Mutation {
    addPainting(name: String!, url: String!): [Painting]
    addNote(title: String!, body: String!): [Note]
  }
`;

const main = async () => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginStopHapiServer({ hapiServer: server }),
    ],
  });

  // server.route([
  //   {
  //     method: 'GET',
  //     path: '/',
  //     handler: async (requset, reply) => {
  //       return `<h1>Test route</h1>`
  //     }
  //   },
  //   {
  //     method: 'GET',
  //     path: '/api/v1/paintings',
  //     handler: async (requset, reply) => {
  //       // return Painting.find();
  //       return `<h1>Test route</h1>`
  //     }
  //   },
  //   {
  //     method: 'POST',
  //     path: '/api/v1/paintings',
  //     handler: async (requset: PaintingPOSTRequest, reply) => {
  //       const { name, url, techniques } = requset.payload;
  //       const painting = new Painting({
  //         name,
  //         url,
  //         techniques
  //       });
  //       return painting.save();
  //     }
  //   }
  // ]);

  await apolloServer.start();
  await apolloServer.applyMiddleware({ cors: { origin: ['*'] }, app: server });
  await server.start();

  console.log(`Server running at ${server.info.uri}`);
  db();
};

const db = () => {
  mongoose.connect(mongoosePath);
  mongoose.connection.once('open', () => {
    console.log(`Connected to DB`);
  });
};

main();