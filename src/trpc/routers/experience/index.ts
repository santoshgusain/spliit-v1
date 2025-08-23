import { createTRPCRouter } from '@/trpc/init'
import { createExperienceProcedure } from '@/trpc/routers/experience/create.procedure'
import { listExperienceProcedure } from '@/trpc/routers/experience/list.procedure'

export const experienceRouter = createTRPCRouter({
  create: createExperienceProcedure,
  list: listExperienceProcedure,
})
