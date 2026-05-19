import { createTRPCRouter } from '@/trpc/init'
import { listCategoriesProcedure } from './list.mongo.procedure'

export const categoriesRouter = createTRPCRouter({
  list: listCategoriesProcedure,
})