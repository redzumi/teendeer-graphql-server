import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Query, Schema } from 'mongoose';

export const NoteSchema = new Schema({
  authorId: String,
  title: String,
  body: String,
})

export const NoteModel = model('Note', NoteSchema);
export const NoteTC = composeMongoose(NoteModel, {});

export const generateNoteSchema = (pubsub?) => {
  const noteApplyPubSub = (resolvers) => {
    Object.keys(resolvers).forEach((k) => {
      resolvers[k] = resolvers[k].wrapResolve(next => async rp => {

        rp.beforeRecordMutate = async (doc, rp) => {
          const { user } = rp.context
          doc.authorId = user._id;

          pubsub.publish('noteAdded', { noteAdded: doc });

          return doc;
        }

        return next(rp)
      })
    })
    return resolvers
  };

  schemaComposer.Query.addFields({
    noteById: NoteTC.mongooseResolvers.findById(),
    noteOne: NoteTC.mongooseResolvers.findOne(),
    noteMany: NoteTC.mongooseResolvers.findMany(),
    currentUserNotes: NoteTC.mongooseResolvers.findMany().wrapResolve((next) => (rp) => {
      const { user } = rp.context;

      rp.beforeQuery = (query: Query<unknown, unknown>) => {
        query.where('authorId', user._id);
      };

      return next(rp);
    }),
  });

  schemaComposer.Mutation.addFields({
    noteUpdateById: NoteTC.mongooseResolvers.updateById(),
    noteRemoveById: NoteTC.mongooseResolvers.removeById(),
    ...noteApplyPubSub({
      noteCreateOne: NoteTC.mongooseResolvers.createOne()
    }),
  });

  return schemaComposer.buildSchema();
};
