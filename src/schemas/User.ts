import { model, Schema } from 'mongoose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { schemaComposer } from 'graphql-compose';

const UserSchema = new Schema({
  firstName: String,
  secondName: String,
  login: String,
  friendsIds: [String],
  talents: {
    type: Map,
    of: {
      talentId: String,
      talentExp: Number,
    }
  }
})

export const UserModel = model('User', UserSchema);
const UserTC = composeMongoose(UserModel, {});

export const buildUserSchema = (pubsub?) => {
  const userApplyPubSub = (resolvers) => {
    Object.keys(resolvers).forEach((k) => {
      resolvers[k] = resolvers[k].wrapResolve(next => async rp => {

        rp.beforeRecordMutate = async (doc, rp) => {
          pubsub.publish('userCreated', { userCreated: doc });
          return doc;
        }

        return next(rp)
      })
    })
    return resolvers
  };

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

  schemaComposer.Query.addFields({
    me: { type: UserTC, args: {}, resolve: (source, args, context) => context.user },
    userById: UserTC.mongooseResolvers.findById(),
    userOne: UserTC.mongooseResolvers.findOne(),
    userMany: UserTC.mongooseResolvers.findMany(),
  });

  schemaComposer.Mutation.addFields({
    ...userApplyPubSub({
      userCreateOne: UserTC.mongooseResolvers.createOne()
    }),
    userUpdateById: UserTC.mongooseResolvers.updateById(),
    userRemoveById: UserTC.mongooseResolvers.removeById(),
    addFriend: {
      type: UserTC,
      args: { friendId: 'String' },
      resolve: async (source, args, context, info) => {
        const user = await UserModel.updateOne(
          { _id: context.user._id },
          { $push: { friendsIds: args.friendId } }
        );
        return user;
      }
    },
    addNote: {
      type: UserTC,
      args: { noteId: 'String', status: 'String' },
      resolve: async (source, args, context, info) => {
        const user = await UserModel.findOne({ _id: context.user._id });
        user.set(`notes.${args.noteId}`, { status: args.status });
        return await user.save();
      }
    },
    addTalent: {
      type: UserTC,
      args: { talentId: 'String' },
      resolve: async (source, args, context, info) => {
        const user = await UserModel.findOne({ _id: context.user._id });
        user.set(`talents.${args.talentId}`, { talentId: args.talentId, talentExp: 0 });
        user.save();
        return user;
      }
    },
    addExpToTalent: {
      type: UserTC,
      args: { talentId: 'String', exp: 'Float' },
      resolve: async (source, args, context, info) => {
        const user = await UserModel.findOne({ _id: context.user._id });
        user.set(`talents.${args.talentId}`, { talentId: args.talentId, talentExp: args.exp });
        user.save();
        return user;
      }
    }
  });

  schemaComposer.Subscription.addFields({
    userCreated: { type: UserTC, args: {}, subscribe: () => pubsub.asyncIterator(['userCreated']), },
  });

  return schemaComposer.buildSchema();
};
