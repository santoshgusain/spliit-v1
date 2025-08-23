import { mongoCreateExperience } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const createExperienceProcedure = baseProcedure
  .input(
    z.object({
      expFormValues: z.object({
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
    await mongoCreateExperience(expFormValues)
    return { success: true }
  })
