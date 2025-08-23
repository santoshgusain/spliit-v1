import { createTRPCRouter } from '@/trpc/init'
import { getUserProcedure } from '@/trpc/routers/user/list.procedure'

export const userRouter = createTRPCRouter({
  fetch: getUserProcedure,
})
