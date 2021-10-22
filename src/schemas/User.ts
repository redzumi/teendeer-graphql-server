import { model, Schema } from 'mongoose';
import { NoteSchema } from '../models/Note';
import { composeMongoose } from 'graphql-compose-mongoose';
import { schemaComposer } from 'graphql-compose';

const UserSchema = new Schema({
  firstName: String,
  secondName: String,
  login: String,
  notes: {
    type: [NoteSchema],
    default: []
  }
})

export const UserModel = model('User', UserSchema);
const UserTC = composeMongoose(UserModel, {});

schemaComposer.Query.addFields({
  userById: UserTC.mongooseResolvers.findById(),
  userOne: UserTC.mongooseResolvers.findOne(),
  userMany: UserTC.mongooseResolvers.findMany(),
});

schemaComposer.Mutation.addFields({
  userCreateOne: UserTC.mongooseResolvers.createOne(),
  userUpdateById: UserTC.mongooseResolvers.updateById(),
  userRemoveById: UserTC.mongooseResolvers.removeById()
});

export const userSchema = schemaComposer.buildSchema();
export default userSchema;