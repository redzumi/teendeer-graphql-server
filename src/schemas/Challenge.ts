import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Query, Schema } from 'mongoose';

export const ChallengeSchema = new Schema({
  name: String,
  description: String,
  reward_cost: Number,
  talentsIds: [String]
})

export const ChallengeModel = model('Challenge', ChallengeSchema);
export const ChallengeTC = composeMongoose(ChallengeModel, {});

export const buildChallengeSchema = (pubsub?) => {
  schemaComposer.Query.addFields({
    challengeById: ChallengeTC.mongooseResolvers.findById(),
    challengeOne: ChallengeTC.mongooseResolvers.findOne(),
    challengeMany: ChallengeTC.mongooseResolvers.findMany(),
    challengeByTalents: ChallengeTC.mongooseResolvers.findMany().wrapResolve((next) => (rp) => {
      const { user } = rp.context;

      const talents = <[{ talentId: string, talentExp: number }]> Array.from(user.talents.values());
      const userTalents = talents.map((talent) => talent?.talentId);

      rp.beforeQuery = (query: Query<unknown, unknown>) => {
        query.where('talentsIds', { "$in": userTalents });
      };

      return next(rp);
    }),
  });

  schemaComposer.Mutation.addFields({
    challengeUpdateById: ChallengeTC.mongooseResolvers.updateById(),
    challengeRemoveById: ChallengeTC.mongooseResolvers.removeById(),
    challengeCreateOne: ChallengeTC.mongooseResolvers.createOne()
  });

  return schemaComposer.buildSchema();
};
