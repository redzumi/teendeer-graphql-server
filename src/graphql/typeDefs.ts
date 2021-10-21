import { gql } from "apollo-server-hapi";

export const typeDefs = gql`
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
