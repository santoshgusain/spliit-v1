import { createTRPCRouter } from '@/trpc/init'
import { createGroupProcedure } from './create.mongo.procedure'
import { getGroupProcedure } from './get.mongo.procedure'
import { listGroupsProcedure } from './list.mongo.procedure'
import { updateGroupProcedure } from './update.mongo.procedure'
import { getGroupDetailsProcedure } from './getDetails.mongo.procedure'
import { activitiesRouter } from './activities/mongo.index'
import { balancesRouter } from './balances/mongo.index'
import { statsRouter } from './stats/mongo.index'
import { expensesRouter } from './expenses/mongo.index'

export const groupsRouter = createTRPCRouter({
  create: createGroupProcedure,
  get: getGroupProcedure,
  list: listGroupsProcedure,
  update: updateGroupProcedure,
  getDetails: getGroupDetailsProcedure,
  expenses: expensesRouter,
  activities: activitiesRouter,
  balances: balancesRouter,
  stats: statsRouter,
})