import { model, Schema } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { schemaComposer } from 'graphql-compose';

import { NoteTC } from './Note';

const UserSchema = new Schema({
  firstName: String,
  secondName: String,
  login: String,
  friendsIds: {
    type: [String],
    default: []
  },
  notesIds: {
    type: [String],
    default: []
  }
})

export const UserModel = model('User', UserSchema);
const UserTC = composeMongoose(UserModel, {});

UserTC.addRelation(
  'friends',
  {
    resolver: () => UserTC.mongooseResolvers.dataLoaderMany(),
    prepareArgs: {
      _ids: (source) => source.friendsIds,
    },
    projection: { friendsIds: 1 },
  }
);

UserTC.addRelation(
  'notes',
  {
    resolver: () => NoteTC.mongooseResolvers.dataLoaderMany(),
    prepareArgs: {
      _ids: (source) => source.notesIds,
    },
    projection: { notesIds: 1 },
  }
);

schemaComposer.Query.addFields({
  userById: UserTC.mongooseResolvers.findById(),
  userOne: UserTC.mongooseResolvers.findOne(),
  userMany: UserTC.mongooseResolvers.findMany(),
});

schemaComposer.Mutation.addFields({
  userCreateOne: UserTC.mongooseResolvers.createOne(),
  userUpdateById: UserTC.mongooseResolvers.updateById(),
  userRemoveById: UserTC.mongooseResolvers.removeById(),
  currentUserAddFriend: {
    type: UserTC,
    args: { friendId: 'String' },
    resolve: async (source, args, context, info) => {
      const user = await UserModel.updateOne(
        { _id: context.user._id },
        { $push: { friendsIds: args.friendId } }
      );
      return user;
    }
  }
});

export const userSchema = schemaComposer.buildSchema();
export default userSchema;