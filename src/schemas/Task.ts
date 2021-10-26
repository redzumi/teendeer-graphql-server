import { schemaComposer } from 'graphql-compose';
import { composeMongoose } from 'graphql-compose-mongoose';
import { model, Query, Schema } from 'mongoose';

export const TaskSchema = new Schema({
  name: String,
  description: String,
  reward_cost: Number,
  talentsIds: [String]
})

export const TaskModel = model('Task', TaskSchema);
export const TaskTC = composeMongoose(TaskModel, {});

export const buildTaskSchema = (pubsub?) => {
  schemaComposer.Query.addFields({
    taskById: TaskTC.mongooseResolvers.findById(),
    taskOne: TaskTC.mongooseResolvers.findOne(),
    taskMany: TaskTC.mongooseResolvers.findMany(),
    tasksForUser: TaskTC.mongooseResolvers.findMany().wrapResolve((next) => (rp) => {
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
    taskUpdateById: TaskTC.mongooseResolvers.updateById(),
    taskRemoveById: TaskTC.mongooseResolvers.removeById(),
    taskCreateOne: TaskTC.mongooseResolvers.createOne()
  });

  return schemaComposer.buildSchema();
};
