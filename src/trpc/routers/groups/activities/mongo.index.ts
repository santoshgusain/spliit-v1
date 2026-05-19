import { createTRPCRouter } from '@/trpc/init'
import { listActivitiesProcedure } from './list.mongo.procedure'

export const activitiesRouter = createTRPCRouter({
  list: listActivitiesProcedure,
})