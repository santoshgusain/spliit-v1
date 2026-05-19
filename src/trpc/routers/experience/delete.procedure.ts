import { mongoDeleteExperience } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const deleteExperienceProcedure = baseProcedure
  .input(
    z.object({
      expId: z.string().min(1),
    }),
  )
  .mutation(async ({ input: { expId } }) => {
    await mongoDeleteExperience(expId)
    return {}
  })
