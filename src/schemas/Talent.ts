import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Schema } from 'mongoose';

export const TalentSchema = new Schema({
  name: String,
  tag: String,
})

export const TalentModel = model('Talent', TalentSchema);
export const TalentTC = composeMongoose(TalentModel, {});

export const buildTalentSchema = (pubsub?) => {
  schemaComposer.Query.addFields({
    talentById: TalentTC.mongooseResolvers.findById(),
    talentOne: TalentTC.mongooseResolvers.findOne(),
    talentMany: TalentTC.mongooseResolvers.findMany(),
  });

  schemaComposer.Mutation.addFields({
    talentUpdateById: TalentTC.mongooseResolvers.updateById(),
    talentRemoveById: TalentTC.mongooseResolvers.removeById(),
    talentCreateOne: TalentTC.mongooseResolvers.createOne()
  });

  return schemaComposer.buildSchema();
};
