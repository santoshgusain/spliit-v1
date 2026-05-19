import { createTRPCRouter } from '@/trpc/init'
import { createExpenseProcedure } from './create.mongo.procedure'
import { deleteExpenseProcedure } from './delete.mongo.procedure'
import { getExpenseProcedure } from './get.mongo.procedure'
import { listExpensesProcedure } from './list.mongo.procedure'
import { updateExpenseProcedure } from './update.mongo.procedure'

export const expensesRouter = createTRPCRouter({
  create: createExpenseProcedure,
  list: listExpensesProcedure,
  get: getExpenseProcedure,
  update: updateExpenseProcedure,
  delete: deleteExpenseProcedure,
})