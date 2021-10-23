import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Schema } from 'mongoose';

export const NoteSchema = new Schema({
  title: String,
  body: String,
})

export const NoteModel = model('Note', NoteSchema);
export const NoteTC = composeMongoose(NoteModel, {});

schemaComposer.Query.addFields({
  noteById: NoteTC.mongooseResolvers.findById(),
  noteOne: NoteTC.mongooseResolvers.findOne(),
  noteMany: NoteTC.mongooseResolvers.findMany(),
});

schemaComposer.Mutation.addFields({
  noteCreateOne: NoteTC.mongooseResolvers.createOne(),
  noteUpdateById: NoteTC.mongooseResolvers.updateById(),
  noteRemoveById: NoteTC.mongooseResolvers.removeById()
});

export const noteSchema = schemaComposer.buildSchema();
export default noteSchema;