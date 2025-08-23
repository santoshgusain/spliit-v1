import { mongoListExperience } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'

export const listExperienceProcedure = baseProcedure.query(async () => {
  return { experiences: await mongoListExperience() }
})
