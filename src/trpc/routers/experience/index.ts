import { createTRPCRouter } from '@/trpc/init'
import { createExperienceProcedure } from '@/trpc/routers/experience/create.procedure'
import { deleteExperienceProcedure } from '@/trpc/routers/experience/delete.procedure'
import { listExperienceProcedure } from '@/trpc/routers/experience/list.procedure'
import { updateExperienceProcedure } from '@/trpc/routers/experience/update.procedure'

export const experienceRouter = createTRPCRouter({
  create: createExperienceProcedure,
  list: listExperienceProcedure,
  delete: deleteExperienceProcedure,
  update: updateExperienceProcedure,
})
