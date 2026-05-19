import { createTRPCRouter } from '@/trpc/init'
import { listGroupBalancesProcedure } from './list.mongo.procedure'

export const balancesRouter = createTRPCRouter({
  list: listGroupBalancesProcedure,
})