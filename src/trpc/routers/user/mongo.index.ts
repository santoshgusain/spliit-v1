import { createTRPCRouter } from '@/trpc/init'
import { getUserProcedure } from '@/trpc/routers/user/list.mongo.procedure'

export const userRouter = createTRPCRouter({
  fetch: getUserProcedure,
})