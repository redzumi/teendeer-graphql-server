import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Schema } from 'mongoose';

export const NoteSchema = new Schema({
  author: String,
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
  });

  schemaComposer.Mutation.addFields({
    // noteCreateOne: NoteTC.mongooseResolvers.createOne(),
    noteUpdateById: NoteTC.mongooseResolvers.updateById(),
    noteRemoveById: NoteTC.mongooseResolvers.removeById(),
    ...noteApplyPubSub({
      noteCreateOne: NoteTC.mongooseResolvers.createOne()
    }),
  });

  return schemaComposer.buildSchema();
};
