import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Query, Schema } from 'mongoose';

export const StepSchema = new Schema({
  name: String,
  description: String,
  reward_cost: Number,
  taskId: String
})

export const StepModel = model('Step', StepSchema);
export const StepTC = composeMongoose(StepModel, {});

export const buildStepSchema = (pubsub?) => {
  schemaComposer.Query.addFields({
    stepById: StepTC.mongooseResolvers.findById(),
    stepOne: StepTC.mongooseResolvers.findOne(),
    stepMany: StepTC.mongooseResolvers.findMany(),
    stepsByTask: {
      type: [StepTC], args: { taskId: 'String' }, resolve: async (source, args, context) => {
        const steps = await StepModel.find({ taskId: args.taskId });
        return steps;
      }
    },
  });

  schemaComposer.Mutation.addFields({
    stepUpdateById: StepTC.mongooseResolvers.updateById(),
    stepRemoveById: StepTC.mongooseResolvers.removeById(),
    stepCreateOne: StepTC.mongooseResolvers.createOne()
  });

  return schemaComposer.buildSchema();
};
