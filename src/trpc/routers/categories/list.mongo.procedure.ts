import { mongoGetCategories } from '@/lib/mongo-api'
import { baseProcedure } from '@/trpc/init'

export const listCategoriesProcedure = baseProcedure.query(async () => {
  const categories = await mongoGetCategories()
  return { categories }
})