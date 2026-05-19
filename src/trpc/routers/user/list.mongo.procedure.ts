import { mongoGetUserById } from '@/lib/api'
import { baseProcedure } from '@/trpc/init'
import { z } from 'zod'

export const getUserProcedure = baseProcedure
  .input(z.object({ userId: z.string().min(1) }))
  .query(async ({ input }) => {
    return { user: await mongoGetUserById(input.userId) }
  })