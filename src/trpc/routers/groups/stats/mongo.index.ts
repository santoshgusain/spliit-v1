import { createTRPCRouter } from '@/trpc/init'
import { getGroupStatsProcedure } from './get.mongo.procedure'

export const statsRouter = createTRPCRouter({
  get: getGroupStatsProcedure,
})