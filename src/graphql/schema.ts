import { GraphQLObjectType, GraphQLString, GraphQLSchema } from "graphql";
import PaintingType from './PaintingType';

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    painting: {
      type: PaintingType,
      args: { id: { type: GraphQLString } },
      resolve(parent, args) {
        // resolving data
      }
    }
  }
});

export default new GraphQLSchema({
  query: RootQuery,
});