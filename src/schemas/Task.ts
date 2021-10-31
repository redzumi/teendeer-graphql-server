import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Query, Schema } from 'mongoose';

export const TaskSchema = new Schema({
  name: String,
  description: String,
  reward_cost: Number,
  challengeId: String
})

export const TaskModel = model('Task', TaskSchema);
export const TaskTC = composeMongoose(TaskModel, {});

export const buildTaskSchema = (pubsub?) => {
  schemaComposer.Query.addFields({
    taskById: TaskTC.mongooseResolvers.findById(),
    taskOne: TaskTC.mongooseResolvers.findOne(),
    taskMany: TaskTC.mongooseResolvers.findMany(),
    tasksByChallenge: {
      type: [TaskTC], args: { challengeId: 'String' }, resolve: async (source, args, context) => {
        const tasks = await TaskModel.find({ challengeId: args.challengeId });
        return tasks;
      }
    },
  });

  schemaComposer.Mutation.addFields({
    taskUpdateById: TaskTC.mongooseResolvers.updateById(),
    taskRemoveById: TaskTC.mongooseResolvers.removeById(),
    taskCreateOne: TaskTC.mongooseResolvers.createOne()
  });

  return schemaComposer.buildSchema();
};
