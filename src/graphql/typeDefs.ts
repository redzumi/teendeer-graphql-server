import { gql } from "apollo-server-hapi";

export const typeDefs = gql`
  type User
  type Note

  type Query {
    serverTime: String
    me: User
  }

  type Subscription {
    noteAdded: Note
  }
`;
