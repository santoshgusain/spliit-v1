import { mongoUpdateExperience } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const updateExperienceProcedure = baseProcedure
  .input(
    z.object({
      expFormValues: z.object({
        id: z.string(),
        userId: z.string(),
        company: z.string(),
        totalWorkingDays: z.number(),
        joining: z.string(),
        leaving: z.string(),
        isWorking: z.boolean(),
      }),
    }),
  )
  .mutation(async ({ input: { expFormValues } }) => {
    await mongoUpdateExperience(expFormValues)
    return { success: true }
  })
