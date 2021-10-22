import { gql } from "apollo-server-hapi";

export const typeDefs = gql`
  type User

  type Query {
    notes: [Note]
    serverTime: String
    me: User
  }

  type Note {
    id: String
    title: String
    body: String
  }

  type Mutation {
    addNote(title: String!, body: String!): [Note]
    editNote(id: String!, title: String!, body: String!): [Note]
  }

  type Subscription {
    noteAdded: Note
  }
`;
